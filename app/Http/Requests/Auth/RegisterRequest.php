<?php

namespace App\Http\Requests\Auth;

use App\Enums\Department;
use App\Enums\Gender;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
            'roll_number' => ['required', 'string', 'max:20', 'unique:users'],
            'department' => ['required', 'string', new Enum(Department::class)],
            'batch' => ['required', 'integer', 'min:1967', 'max:' . date('Y')],
            'gender' => ['required', 'string', new Enum(Gender::class)],
            'blood_group' => ['nullable', 'string', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'phone' => ['nullable', 'string', 'max:20'],
            'student_id_card' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'student_id_card.required' => 'Please upload a photo of your student ID card.',
            'student_id_card.image' => 'The student ID card must be an image file.',
            'student_id_card.max' => 'The student ID card image must not exceed 5MB.',
            'roll_number.unique' => 'This roll number is already registered.',
            'email.unique' => 'This email is already registered.',
        ];
    }
}
