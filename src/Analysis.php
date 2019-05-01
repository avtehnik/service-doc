<?php declare(strict_types=1);

/**
 * @license Apache 2.0
 */

namespace ServiceDoc;

use Closure;
use Exception;
use SplObjectStorage;
use stdClass;
use ServiceDoc\Annotations\AbstractAnnotation;
use ServiceDoc\Annotations\ServiceDoc;
use ServiceDoc\Processors\AugmentOperations;
use ServiceDoc\Processors\AugmentParameters;
use ServiceDoc\Processors\AugmentProperties;
use ServiceDoc\Processors\AugmentSchemas;
use ServiceDoc\Processors\BuildPaths;
use ServiceDoc\Processors\CleanUnmerged;
use ServiceDoc\Processors\InheritProperties;
use ServiceDoc\Processors\MergeIntoComponents;
use ServiceDoc\Processors\MergeIntoServiceDoc;
use ServiceDoc\Processors\MergeJsonContent;
use ServiceDoc\Processors\MergeXmlContent;
use ServiceDoc\Processors\OperationId;
use ServiceDoc\Processors\ImportTraits;

/**
 * Result of the analyser which pretends to be an array of annotations, but also contains detected classes and helper
 * functions for the processors.
 */
class Analysis
{
    /**
     * @var SplObjectStorage
     */
    public $annotations;

    /**
     * Class definitions
     *
     * @var array
     */
    public $classes = [];

    /**
     * Trait definitions
     *
     * @var array
     */
    public $traits = [];

    /**
     * The target ServiceDoc annotation.
     *
     * @var ServiceDoc
     */
    public $servicedoc;

    /**
     * Registry for the post-processing operations.
     *
     * @var Closure[]
     */
    private static $processors;

    /**
     * @param array $annotations
     * @param null  $context
     */
    public function __construct($annotations = [], $context = null)
    {
        $this->annotations = new SplObjectStorage();
        if (count($annotations) !== 0) {
            if ($context === null) {
                $context = Context::detect(1);
            }
            $this->addAnnotations($annotations, $context);
        }
    }

    /**
     * @param AbstractAnnotation $annotation
     * @param Context            $context
     */
    public function addAnnotation($annotation, $context)
    {
        if ($this->annotations->contains($annotation)) {
            return;
        }
        if ($annotation instanceof AbstractAnnotation) {
            $context = $annotation->_context;
            if ($this->servicedoc === null && $annotation instanceof ServiceDoc) {
                $this->servicedoc = $annotation;
            }
        } else {
            if ($context->is('annotations') === false) {
                $context->annotations = [];
            }
            if (in_array($annotation, $context->annotations, true) === false) {
                $context->annotations[] = $annotation;
            }
        }
        $this->annotations->attach($annotation, $context);
        $blacklist = property_exists($annotation, '_blacklist') ? $annotation::$_blacklist : [];
        foreach ($annotation as $property => $value) {
            if (in_array($property, $blacklist)) {
                if ($property === '_unmerged') {
                    foreach ($value as $item) {
                        $this->addAnnotation($item, $context);
                    }
                }
                continue;
            } elseif (is_array($value)) {
                foreach ($value as $item) {
                    if ($item instanceof AbstractAnnotation) {
                        $this->addAnnotation($item, $context);
                    }
                }
            } elseif ($value instanceof AbstractAnnotation) {
                $this->addAnnotation($value, $context);
            }
        }
    }

    /**
     * @param array   $annotations
     * @param Context $context
     */
    public function addAnnotations($annotations, $context)
    {
        foreach ($annotations as $annotation) {
            $this->addAnnotation($annotation, $context);
        }
    }

    /**
     * @param array $definition
     */
    public function addClassDefinition($definition)
    {
        $class = $definition['context']->fullyQualifiedName($definition['class']);
        $this->classes[$class] = $definition;
    }

    /**
     * @param array $definition
     */
    public function addTraitDefinition($definition)
    {
        $trait = $definition['context']->fullyQualifiedName($definition['trait']);
        $this->traits[$trait] = $definition;
    }

    /**
     * @param Analysis $analysis
     */
    public function addAnalysis($analysis)
    {
        foreach ($analysis->annotations as $annotation) {
            $this->addAnnotation($annotation, $analysis->annotations[$annotation]);
        }
        $this->classes = array_merge($this->classes, $analysis->classes);
        $this->traits = array_merge($this->traits, $analysis->traits);
        if ($this->servicedoc === null && $analysis->servicedoc) {
            $this->servicedoc = $analysis->servicedoc;
            $analysis->target->_context->analysis = $this;
        }
    }

    public function getSubClasses($class)
    {
        $definitions = [];
        foreach ($this->classes as $subclass => $definition) {
            if ($definition['extends'] === $class) {
                $definitions[$subclass] = $definition;
                $definitions = array_merge($definitions, $this->getSubClasses($subclass));
            }
        }

        return $definitions;
    }

    public function getSuperClasses($class)
    {
        $classDefinition = isset($this->classes[$class]) ? $this->classes[$class] : null;
        if (!$classDefinition || empty($classDefinition['extends'])) { // unknown class, or no inheritance?
            return [];
        }
        $extends = $classDefinition['extends'];
        $extendsDefinition = isset($this->classes[$extends]) ? $this->classes[$extends] : null;
        if (!$extendsDefinition) {
            return [];
        }
        $definitions = array_merge([$extends => $extendsDefinition], $this->getSuperClasses($extends));
        return $definitions;
    }

    /**
     * Returns an array of traits used by the given class or by classes which it extends
     *
     * @param string  $class
     *
     * @return array
     */
    public function getTraitsOfClass($class)
    {
        $definitions = [];

        // in case there is a hierarchy of classes
        $classes = $this->getSuperClasses($class);
        if (is_array($classes)) {
            foreach ($classes as $subClass) {
                if (isset($subClass['traits'])) {
                    foreach ($subClass['traits'] as $classTrait) {
                        foreach ($this->traits as $trait) {
                            if ($classTrait === $trait['trait']) {
                                $traitDefinition[$trait['trait']] = $trait;
                                $definitions = array_merge($definitions, $traitDefinition);
                            }
                        }
                    }
                }
            }
        }

        // trait used by the given class
        $classDefinition = isset($this->classes[$class]) ? $this->classes[$class] : null;
        if (!$classDefinition || empty($classDefinition['traits'])) {
            return $definitions;
        }
        $classTraits = $classDefinition['traits'];
        foreach ($this->traits as $trait) {
            foreach ($classTraits as $classTrait => $name) {
                if ($trait['trait'] === $name) {
                    $traitDefinition[$name] = $trait;
                    $definitions = array_merge($definitions, $traitDefinition);
                }
            }
        }

        return $definitions;
    }

    /**
     *
     * @param string  $class
     * @param boolean $strict Innon-strict mode childclasses are also detected.
     *
     * @return array
     */
    public function getAnnotationsOfType($class, $strict = false)
    {
        $annotations = [];
        if ($strict) {
            foreach ($this->annotations as $annotation) {
                if (get_class($annotation) === $class) {
                    $annotations[] = $annotation;
                }
            }
        } else {
            foreach ($this->annotations as $annotation) {
                if ($annotation instanceof $class) {
                    $annotations[] = $annotation;
                }
            }
        }

        return $annotations;
    }

    /**
     *
     * @param object $annotation
     *
     * @return \ServiceDoc\Context
     */
    public function getContext($annotation)
    {
        if ($annotation instanceof AbstractAnnotation) {
            return $annotation->_context;
        }
        if ($this->annotations->contains($annotation) === false) {
            throw new Exception('Annotation not found');
        }
        $context = $this->annotations[$annotation];
        if ($context instanceof Context) {
            return $context;
        }
        var_dump($context);
        ob_flush();
        die;
        throw new Exception('Annotation has no context'); // Weird, did you use the addAnnotation/addAnnotations methods?
    }

    /**
     * Build an analysis with only the annotations that are merged into the OpenAPI annotation.
     *
     * @return Analysis
     */
    public function merged()
    {
        if (!$this->servicedoc) {
            throw new Exception('No servicedoc target set. Run the MergeIntoServiceDoc processor');
        }
        $unmerged = $this->servicedoc->_unmerged;
        $this->servicedoc->_unmerged = [];
        $analysis = new Analysis([$this->servicedoc]);
        $this->servicedoc->_unmerged = $unmerged;

        return $analysis;
    }

    /**
     * Analysis with only the annotations that not merged.
     *
     * @return Analysis
     */
    public function unmerged()
    {
        return $this->split()->unmerged;
    }

    /**
     * Split the annotation into two analysis.
     * One with annotations that are merged and one with annotations that are not merged.
     *
     * @return object {merged: Analysis, unmerged: Analysis}
     */
    public function split()
    {
        $result = new stdClass();
        $result->merged = $this->merged();
        $result->unmerged = new Analysis();
        foreach ($this->annotations as $annotation) {
            if ($result->merged->annotations->contains($annotation) === false) {
                $result->unmerged->annotations->attach($annotation, $this->annotations[$annotation]);
            }
        }

        return $result;
    }

    /**
     * Apply the processor(s)
     *
     * @param Closure|Closure[] $processors One or more processors
     */
    public function process($processors = null)
    {
        if ($processors === null) { // Use the default and registered processors.
            $processors = self::processors();
        }
        if (is_array($processors) === false && is_callable($processors)) {
            $processors = [$processors];
        }
        foreach ($processors as $processor) {
            $processor($this);
        }
    }

    /**
     * Get direct access to the processors array.
     *
     * @return array reference
     */
    public static function &processors()
    {
        if (!self::$processors) {
            // Add default processors.
            self::$processors = [
                new MergeIntoServiceDoc(),
                new MergeIntoComponents(),
                new ImportTraits(),
                new AugmentSchemas(),
                new AugmentProperties(),
//                new BuildPaths(),
                // new HandleReferences(),

                new InheritProperties(),
                new AugmentOperations(),
                new AugmentParameters(),
                new MergeJsonContent(),
                new MergeXmlContent(),
                new OperationId(),
                new CleanUnmerged(),
            ];
        }

        return self::$processors;
    }

    /**
     * Register a processor
     *
     * @param Closure $processor
     */
    public static function registerProcessor($processor)
    {
        array_push(self::processors(), $processor);
    }

    /**
     * Unregister a processor
     *
     * @param Closure $processor
     */
    public static function unregisterProcessor($processor)
    {
        $processors = &self::processors();
        $key = array_search($processor, $processors, true);
        if ($key === false) {
            throw new Exception('Given processor was not registered');
        }
        unset($processors[$key]);
    }

    public function validate()
    {
        if ($this->servicedoc) {
            return $this->servicedoc->validate();
        }
        Logger::notice('No servicedoc target set. Run the MergeIntoServiceDoc processor before validate()');

        return false;
    }
}
