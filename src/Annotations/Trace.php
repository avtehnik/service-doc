<?php declare(strict_types=1);

/**
 * @license Apache 2.0
 */

namespace ServiceDoc\Annotations;

/**
 * @Annotation
 */
class Trace extends Operation
{
    /**
     * @inheritdoc
     */
    public $method = 'trace';

    /**
     * @inheritdoc
     */
    public static $_parents = [
        PathItem::class
    ];
}
