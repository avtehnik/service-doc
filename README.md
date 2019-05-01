## Installation (with [Composer](https://getcomposer.org))

```bash
composer require avtehnik/service-doc
```

## Usage

Add annotations to your php files.

```php
/**
 * @ServiceDoc\Info(title="My First API", version="0.1")
 */

/**
 * @ServiceDoc\PathItem(
 *     microservice="payment",
 *     path="/wallet-prices",
 *     method="get",
 *     @ServiceDoc\Tag(
 *          name="user",
 *     )
 * )
 * @param $destination_code
 * @param $source_code
 *
 * @return
 */
```
### Usage from Yii


Add servicedoc section to actions array

```php
    class DocumentationController extends Controller
    {
        public function actions()
        {
            return [
                'servicedoc' => [
                    'class' => 'ServiceDoc\YiiServiceDocAction',
                    'scanDir' => [
                        Yii::getAlias('@common/components')
                    ],
                ],
            ];
        }
    }
    
```

and then you can access to docs with url `/documentation/servicedoc`


### Usage from php

Generate always-up-to-date documentation.

```php
<?php
require("vendor/autoload.php");
$swagger = \ServiceDoc\scan(__DIR__);
header('Content-type: application/json; charset=utf-8');
echo $swagger->toJson();
```
