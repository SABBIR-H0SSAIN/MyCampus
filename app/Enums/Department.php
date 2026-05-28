<?php

namespace App\Enums;

enum Department: string
{
    case CSE = 'CSE';
    case EEE = 'EEE';
    case ECE = 'ECE';
    case BME = 'BME';
    case MTE = 'MTE';
    case CE = 'CE';
    case URP = 'URP';
    case BECM = 'BECM';
    case Arch = 'Arch';
    case ME = 'ME';
    case IEM = 'IEM';
    case TE = 'TE';
    case LE = 'LE';
    case ESE = 'ESE';
    case ChE = 'ChE';
    case MSE = 'MSE';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
