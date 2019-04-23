<?php declare(strict_types=1);

/**
 * @license Apache 2.0
 */

namespace ServiceDoc\Processors;

use ServiceDoc\Annotations\ServiceDoc;
use ServiceDoc\Analysis;
use ServiceDoc\Context;

/**
 * Merge all @ServiceDoc\ServiceDoc annotations into one.
 */
class MergeIntoServiceDoc
{
    public function __invoke(Analysis $analysis)
    {
        // Auto-create the ServiceDoc annotation.
        if (!$analysis->servicedoc) {
            $context = new Context(['analysis' => $analysis]);
            $analysis->addAnnotation(new ServiceDoc(['_context' => $context]), $context);
        }
        $servicedoc = $analysis->servicedoc;
        $servicedoc->_analysis = $analysis;

        // Merge annotations into the target servicedoc
        $merge = [];
        $classes = array_keys(ServiceDoc::$_nested);
        foreach ($analysis->annotations as $annotation) {
            if ($annotation === $servicedoc) {
                continue;
            }
            if ($annotation instanceof ServiceDoc) {
                $paths = $annotation->paths;
                unset($annotation->paths);
                $servicedoc->mergeProperties($annotation);
                if ($paths !== UNDEFINED) {
                    foreach ($paths as $path) {
                        if ($servicedoc->paths === UNDEFINED) {
                            $servicedoc->paths = [];
                        }
                        $servicedoc->paths[] = $path;
                    }
                }
            } elseif (in_array(get_class($annotation), $classes) && property_exists($annotation, '_context') && $annotation->_context->is('nested') === false) { // A top level annotation.
                // Also merge @ServiceDoc\Info, @ServiceDoc\Server and other directly nested annotations.
                $merge[] = $annotation;
            }
        }
        $servicedoc->merge($merge, true);
    }
}
