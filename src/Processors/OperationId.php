<?php declare(strict_types=1);

/**
 * @license Apache 2.0
 */

namespace ServiceDoc\Processors;

use ServiceDoc\Analysis;
use ServiceDoc\Annotations\Operation;
use ServiceDoc\Annotations\PathItem;

/**
 * Generate the OperationId based on the context of the ServiceDoc comment.
 */
class OperationId
{
    public function __invoke(Analysis $analysis)
    {
        $allOperations = $analysis->getAnnotationsOfType(Operation::class);

        foreach ($allOperations as $operation) {
            if ($operation->operationId !== UNDEFINED) {
                continue;
            }
            $context = $operation->_context;
            if ($context && $context->method) {
                if ($context->class) {
                    if ($context->namespace) {
                        $operation->operationId = $context->namespace . "\\" . $context->class . "::" . $context->method;
                    } else {
                        $operation->operationId = $context->class . "::" . $context->method;
                    }
                } else {
                    $operation->operationId = $context->method;
                }
            }
        }

        $allOperations = $analysis->getAnnotationsOfType(PathItem::class);

        foreach ($allOperations as $operation) {
            if ($operation->operationId !== UNDEFINED) {
                continue;
            }
            $context = $operation->_context;
            if ($context && $context->method) {
                if ($context->class) {
                    if ($context->namespace) {
                        $operation->operationId = $context->namespace . "\\" . $context->class . "::" . $context->method;
                    } else {
                        $operation->operationId = $context->class . "::" . $context->method;
                    }
                } else {
                    $operation->operationId = $context->method;
                }
            }
        }


    }
}
