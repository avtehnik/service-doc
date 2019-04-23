<?php declare(strict_types=1);

/**
 * @license Apache 2.0
 */

namespace ServiceDoc\Processors;

use ServiceDoc\Annotations\Components;
use ServiceDoc\Analysis;
use ServiceDoc\Context;
use ServiceDoc\UNDEFINED;

/**
 * Merge reusable annotation into @ServiceDoc\Schemas
 */
class MergeIntoComponents
{
    public function __invoke(Analysis $analysis)
    {
        $components = $analysis->servicedoc->components;
        if ($components === UNDEFINED) {
            $components = new Components([]);
            $components->_context->generated = true;
        }
        $classes = array_keys(Components::$_nested);
        foreach ($analysis->annotations as $annotation) {
            $class = get_class($annotation);
            if (in_array($class, $classes) && $annotation->_context->is('nested') === false) { // A top level annotation.
                $components->merge([$annotation], true);
                $analysis->servicedoc->components = $components;
            }
        }
    }
}
