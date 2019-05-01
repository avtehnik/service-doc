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
class PathItem extends AbstractAnnotation
{
    /**
     * key for the Path Object (ServiceDoc->paths array).
     *
     * @var string
     */
    public $path = UNDEFINED;

    /**
     * An optional, string summary, intended to apply to all operations in this path.
     *
     * @var string
     */
    public $summary = UNDEFINED;

    /**
     * A definition of a GET operation on this path.
     *
     * @var Get
     */
    public $get = UNDEFINED;

    /**
     * A definition of a PUT operation on this path.
     *
     * @var Put
     */
    public $put = UNDEFINED;

    /**
     * A definition of a POST operation on this path.
     *
     * @var Post
     */
    public $post = UNDEFINED;

    /**
     * A definition of a DELETE operation on this path.
     *
     * @var Delete
     */
    public $delete = UNDEFINED;

    /**
     * A definition of a OPTIONS operation on this path.
     *
     * @var Options
     */
    public $options = UNDEFINED;

    /**
     * A definition of a HEAD operation on this path.
     *
     * @var Head
     */
    public $head = UNDEFINED;

    /**
     * A definition of a PATCH operation on this path.
     *
     * @var Patch
     */
    public $patch = UNDEFINED;

    /**
     * A definition of a Method path.
     *
     * @var Method
     */
    public $method = UNDEFINED;


    /**
     * A definition of a Tags.
     *
     * @var Tags
     */
    public $tags = UNDEFINED;

    /**
     * A definition of a TRACE operation on this path.
     *
     * @var Trace
     */
    public $trace = UNDEFINED;

    /**
     * An alternative server array to service all operations in this path.
     *
     * @var Server[]
     */
    public $servers = UNDEFINED;

    /**
     * An alternative server array to service all operations in this path.
     *
     * @var Server[]
     */
    public $microservice = UNDEFINED;

    /**
     * A list of parameters that are applicable for all the operations described under this path.
     * These parameters can be overridden at the operation level, but cannot be removed there.
     * The list must not include duplicated parameters.
     * A unique parameter is defined by a combination of a name and location.
     * The list can use the Reference Object to link to parameters that are defined at the OpenAPI Object's components/parameters.
     *
     * @var Parameter[]
     */
    public $parameters = UNDEFINED;


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
    public static $_types = [
        'path' => 'string',
        'method'=> 'string',
        'microservice' => 'string'
    ];

    /**
     * @inheritdoc
     */
    public static $_required = ['microservice'];

    /**
     * @inheritdoc
     */
    public static $_nested = [
        Parameter::class => ['parameters'],
        Server::class => ['servers'],
        Tag::class => ['tags'],
    ];

    /**
     * @inheritdoc
     */
    public static $_parents = [
        ServiceDoc::class
    ];
}
