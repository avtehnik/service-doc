<?php declare(strict_types=1);

/**
 * @license Apache 2.0
 */

namespace ServiceDoc\Processors;

use ServiceDoc\Annotations\PathItem;
use ServiceDoc\Annotations\Operation;
use ServiceDoc\Logger;
use ServiceDoc\Context;
use ServiceDoc\Analysis;

/**
 * Build the servicedoc->paths using the detected @ServiceDoc\PathItem and @ServiceDoc\Operations (like @ServiceDoc\Get, @ServiceDoc\Post, etc)
 */
class BuildPaths
{
    public function __invoke(Analysis $analysis)
    {
        $paths = [];
        // Merge @ServiceDoc\PathItems with the same path.
        if ($analysis->servicedoc->paths !== UNDEFINED) {
            foreach ($analysis->servicedoc->paths as $annotation) {
                if (empty($annotation->path)) {
                    Logger::notice($annotation->identity() . ' is missing required property "path" in ' . $annotation->_context);
                } elseif (isset($paths[$annotation->path])) {
                    $paths[$annotation->path]->mergeProperties($annotation);
                    $analysis->annotations->detach($annotation);
                } else {
                    $paths[$annotation->path] = $annotation;
                }
            }
        }

        // Merge @ServiceDoc\Operations into existing @ServiceDoc\PathItems or create a new one.
        $operations = $analysis->unmerged()->getAnnotationsOfType(Operation::class);
        foreach ($operations as $operation) {
            if ($operation->path) {
                if (empty($paths[$operation->path])) {
                    $paths[$operation->path] = new PathItem(
                        [
                            'path' => $operation->path,
                            '_context' => new Context(['generated' => true], $operation->_context)
                        ]
                    );
                    $analysis->annotations->attach($paths[$operation->path]);
                }
                if ($paths[$operation->path]->merge([$operation])) {
                    Logger::notice('Unable to merge '.$operation->identity() .' in '.$operation->_context);
                }
            }
        }
        if (count($paths)) {
            $analysis->servicedoc->paths = array_values($paths);
        }
    }
}
