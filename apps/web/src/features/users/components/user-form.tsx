import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldLabel,
  FieldContent,
  FieldGroup,
  FieldDescription,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingOverlay } from '@/components/ui/loading';

import type { User, CreateUserData, UpdateUserData } from '../types/user.types';

// Zod schema for validation
const userFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(3, 'Password must be at least 3 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  deptNo: z.string().min(1, 'Department code is required'),
  deptName: z.string().min(2, 'Department name must be at least 2 characters'),
  role: z.enum(['admin', 'regular']),
  isActive: z.boolean(),
});

export interface UserFormProps {
  user?: User; // For edit mode
  onSubmit: (data: CreateUserData | UpdateUserData) => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export function UserForm({
  user,
  onSubmit,
  isLoading = false,
  title,
  description,
}: UserFormProps) {
  const isEdit = !!user;

  const form = useForm({
    defaultValues: {
      username: user?.username || '',
      password: user ? '' : '', // Empty password for both new and edit
      fullName: user?.fullName || '',
      deptNo: user?.deptNo || '',
      deptName: user?.deptName || '',
      role: user?.role || 'regular',
      isActive: user?.isActive ?? true,
    },
    validators: {
      onSubmit: userFormSchema,
      onChange: userFormSchema,
      onBlur: userFormSchema,
    },
    onSubmit: async ({ value }) => {
      const submitData = { ...value };

      // Don't send password if it's empty in edit mode
      if (isEdit && !submitData.password) {
        const { password, ...dataWithoutPassword } = submitData;
        await onSubmit(dataWithoutPassword);
        return;
      }

      await onSubmit(submitData);
    },
  });

  return (
    <LoadingOverlay
      isLoading={isLoading}
      message={isEdit ? 'Updating user...' : 'Creating user...'}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-900">
            {title || (isEdit ? 'Edit User' : 'Create New User')}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {description ||
              (isEdit
                ? 'Update user information and permissions'
                : 'Add a new user to system with appropriate permissions')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <FieldGroup>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field
                  name="username"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          disabled={isEdit}
                          aria-invalid={isInvalid}
                          placeholder="Enter username"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="password"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Password {isEdit && '(leave blank to keep current)'}
                        </FieldLabel>
                        <Input
                          id={field.name}
                          type="password"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          aria-invalid={isInvalid}
                          placeholder={
                            isEdit
                              ? 'Leave blank to keep current password'
                              : 'Enter password'
                          }
                          required={!isEdit}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>

              <form.Field
                name="fullName"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        placeholder="Enter full name"
                        required
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field
                  name="deptNo"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Department Code
                        </FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          aria-invalid={isInvalid}
                          placeholder="e.g., IT001"
                          required
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="deptName"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Department Name
                        </FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          aria-invalid={isInvalid}
                          placeholder="e.g., Information Technology"
                          required
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field
                  name="role"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) =>
                            field.handleChange(value as 'admin' | 'regular')
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="isActive"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field orientation="horizontal" data-invalid={isInvalid}>
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                          <FieldDescription>
                            Enable or disable user account
                          </FieldDescription>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </FieldContent>
                        <Checkbox
                          checked={field.state.value}
                          onCheckedChange={(checked) =>
                            field.handleChange(checked === true)
                          }
                        />
                      </Field>
                    );
                  }}
                />
              </div>
            </FieldGroup>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isEdit ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </LoadingOverlay>
  );
}
