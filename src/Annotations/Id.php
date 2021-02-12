<?php


namespace ServiceDoc\Annotations;

class Id
{
    private static $id = 0;

    public static function getId()
    {
        return dechex(self::$id++);
    }
}

