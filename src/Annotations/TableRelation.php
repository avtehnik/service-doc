<?php declare(strict_types=1);

/**
 * @license Apache 2.0
 */

namespace ServiceDoc\Annotations;

/**
 * @Annotation
 * A "Path Item Object": https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#path-item-object
 * Describes the operations available on a single path.
 * A Path Item may be empty, due to ACL constraints.
 * The path itself is still exposed to the documentation viewer but they will not know which operations and parameters are available.
 */
class TableRelation extends AbstractAnnotation
{
    public $from = UNDEFINED;
    public $to = UNDEFINED;
    public $db = UNDEFINED;

    public $parameters = UNDEFINED;


    /**
     * @inheritdoc
     */
    public static $_types = [
        'from' => 'string',
        'to' => 'string',
        'db' => 'string'
    ];

    /**
     * @inheritdoc
     */
    public static $_required = ['from','to'];

    /**
     * @inheritdoc
     */
    public static $_nested = [
    ];

    /**
     * @inheritdoc
     */
    public static $_parents = [
        Table::class,
    ];
}
