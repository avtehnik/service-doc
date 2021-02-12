<?php declare(strict_types=1);

/**
 * @license Apache 2.0
 */

namespace ServiceDoc\Annotations;

/**
 * @Annotation
 * An "Info Object": https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#info-object
 *
 * The object provides metadata about the API.
 * The metadata may be used by the clients if needed, and may be presented in editing or documentation generation tools for convenience.
 */
class Table extends AbstractAnnotation
{
    /**
     * The title of the application.
     *
     * @var string
     */
    public $name = UNDEFINED;

    /**
     * A short description of the application. CommonMark syntax may be used for rich text representation.
     *
     * @var string
     */
    public $db = UNDEFINED;

    public $relations = UNDEFINED;

    /**
     * The name of an existing, resolvable OA operation, as defined with a unique operationId.
     * This field is mutually exclusive of the operationRef field.
     *
     * @var string
     */
    public $operationId = UNDEFINED;


    /**
     * @inheritdoc
     */
    public static $_required = [
        'name',
        'db'
    ];

    /**
     * @inheritdoc
     */
    public static $_types = [
        'name' => 'string',
        'db' => 'string',
    ];

    /**
     * @inheritdoc
     */
    public static $_nested = [
        TableRelation::class => ['relations']
    ];

    /**
     * @inheritdoc
     */
    public static $_parents = [
        ServiceDoc::class
    ];
}
