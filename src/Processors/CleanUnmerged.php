<?php declare(strict_types=1);

/**
 * @license Apache 2.0
 */

namespace ServiceDoc\Processors;

use ServiceDoc\Analysis;
use SplObjectStorage;

/**
 *
 */
class CleanUnmerged
{
    public function __invoke(Analysis $analysis)
    {
        $split = $analysis->split();
        $merged = $split->merged->annotations;
        $unmerged = $split->unmerged->annotations;

        foreach ($analysis->annotations as $annotation) {
            if (property_exists($annotation, '_unmerged')) {
                foreach ($annotation->_unmerged as $i => $item) {
                    if ($merged->contains($item)) {
                        unset($annotation->_unmerged[$i]); // Property was merged
                    }
                }
            }
        }
        $analysis->servicedoc->_unmerged = [];
        foreach ($unmerged as $annotation) {
            $analysis->servicedoc->_unmerged[] = $annotation;
        }
    }
}
