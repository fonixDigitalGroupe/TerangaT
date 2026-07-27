<?php

namespace App\Exceptions;

use Exception;

class TransactionException extends Exception
{
    public static function invalidType(string $type): self
    {
        return new self("Type de transaction invalide : {$type}");
    }

    public static function paydunyaError(string $message): self
    {
        return new self("Erreur PayDunya : {$message}");
    }
}
