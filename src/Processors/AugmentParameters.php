<?php declare(strict_types=1);

/**
 * @license Apache 2.0
 */

namespace ServiceDoc\Processors;

use ServiceDoc\Analysis;

/**
 * Use the parameter->name as keyfield (parameter->parameter) when used as reusable component (servicedoc->components->parameters)
 */
class AugmentParameters
{
    public function __invoke(Analysis $analysis)
    {
        if ($analysis->servicedoc->components !== UNDEFINED && $analysis->servicedoc->components->parameters !== UNDEFINED) {
            $keys = [];
            $parametersWithoutKey = [];
            foreach ($analysis->servicedoc->components->parameters as $parameter) {
                if ($parameter->parameter !== UNDEFINED) {
                    $keys[$parameter->parameter] = $parameter;
                } else {
                    $parametersWithoutKey[] = $parameter;
                }
            }
            foreach ($parametersWithoutKey as $parameter) {
                if ($parameter->name !== UNDEFINED && empty($keys[$parameter->name])) {
                    $parameter->parameter = $parameter->name;
                    $keys[$parameter->parameter] = $parameter;
                }
            }
        }
    }
}
