<?php

namespace ServiceDoc\Processors;

use ServiceDoc\Analyser;
use ServiceDoc\Annotations\Property;
use ServiceDoc\Annotations\ServiceDoc;
use ServiceDoc\Annotations\Definition;
use ServiceDoc\Annotations\Schema;
use ServiceDoc\Analysis;
use Traversable;

class ImportTraits
{
    public function __invoke(Analysis $analysis)
    {
        $schemas = $analysis->getAnnotationsOfType(Schema::class);
        foreach ($schemas as $schema) {
            $existing = [];
            if ($schema->_context->is('class')) {
                $traits = $analysis->getTraitsOfClass($schema->_context->fullyQualifiedName($schema->_context->class));
                foreach ($traits as $trait) {
                    foreach ($trait['properties'] as $property) {
                        if (is_array($property->annotations) === false && !($property->annotations instanceof Traversable)) {
                            continue;
                        }
                        foreach ($property->annotations as $annotation) {
                            if ($annotation instanceof Property && in_array($annotation->property, $existing) === false) {
                                $existing[] = $annotation->property;
                                $schema->merge([$annotation], true);
                            }
                        }
                    }
                }
            }
        }
    }
}
