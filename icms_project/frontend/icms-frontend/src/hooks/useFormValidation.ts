import { useForm, UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNotifications } from '../context/AppContext';
import { handleApiError } from '../utils/errorHandler';

interface UseFormValidationProps<T> {
  schema: yup.ObjectSchema<any>;
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
}

export const useFormValidation = <T extends Record<string, any>>({
  schema,
  defaultValues,
  onSubmit,
}: UseFormValidationProps<T>): UseFormReturn<T> & {
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;
} => {
  const { addNotification } = useNotifications();
  const form = useForm<T>({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onBlur',
  });

  const handleSubmit = async () => {
    try {
      const data = await form.handleSubmit((values) => onSubmit(values))();
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      addNotification({
        type: 'error',
        message: errorMessage,
      });
      throw error;
    }
  };

  return {
    ...form,
    handleSubmit,
    isSubmitting: form.formState.isSubmitting,
  };
};

// Common validation schemas
export const validationSchemas = {
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  phone: yup
    .string()
    .matches(
      /^\+?[1-9]\d{1,14}$/,
      'Phone number must be in international format (e.g., +1234567890)'
    )
    .required('Phone number is required'),
  date: yup.date().required('Date is required'),
  time: yup
    .string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .required('Time is required'),
};
