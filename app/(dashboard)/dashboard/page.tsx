'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { useActionState, useState } from 'react';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { removeTeamMember, inviteTeamMember } from '@/app/(login)/actions';
import useSWR from 'swr';
import { Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { getSocialMediaIntegrationsClient } from '@/lib/api/social-media';

type ActionState = {
  error?: string;
  success?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SubscriptionSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Team Subscription</CardTitle>
      </CardHeader>
    </Card>
  );
}

function ManageSubscription() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p className="font-medium">
                Current Plan: Free
              </p>
              <p className="text-sm text-muted-foreground">
                No active subscription
              </p>
            </div>
            <Button variant="outline" disabled>
              Manage Subscription
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembersSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4 mt-1">
          <div className="flex items-center space-x-4">
            <div className="size-8 rounded-full bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-14 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembers() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(removeTeamMember, {});

  const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) => {
    return user.name || user.email || 'Unknown User';
  };

  if (!teamData?.teamMembers?.length) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No team members yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {teamData.teamMembers.map((member, index) => (
            <li key={member.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-medium">
                    {getUserDisplayName(member.user)}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {member.role}
                  </p>
                </div>
              </div>
              {index > 1 ? (
                <form action={removeAction}>
                  <input type="hidden" name="memberId" value={member.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={isRemovePending}
                  >
                    {isRemovePending ? 'Removing...' : 'Remove'}
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
        {removeState?.error && (
          <p className="text-red-500 mt-4">{removeState.error}</p>
        )}
      </CardContent>
    </Card>
  );
}

function InviteTeamMemberSkeleton() {
  return (
    <Card className="h-[260px]">
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
    </Card>
  );
}

function InviteTeamMember() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const isOwner = user?.role === 'owner';
  const [inviteState, inviteAction, isInvitePending] = useActionState<
    ActionState,
    FormData
  >(inviteTeamMember, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={inviteAction} className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-2">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email"
              required
              disabled={!isOwner}
            />
          </div>
          <div>
            <Label>Role</Label>
            <RadioGroup
              defaultValue="member"
              name="role"
              className="flex space-x-4"
              disabled={!isOwner}
            >
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="member" id="member" />
                <Label htmlFor="member">Member</Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="owner" id="owner" />
                <Label htmlFor="owner">Owner</Label>
              </div>
            </RadioGroup>
          </div>
          {inviteState?.error && (
            <p className="text-red-500">{inviteState.error}</p>
          )}
          {inviteState?.success && (
            <p className="text-green-500">{inviteState.success}</p>
          )}
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isInvitePending || !isOwner}
          >
            {isInvitePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inviting...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Invite Member
              </>
            )}
          </Button>
        </form>
      </CardContent>
      {!isOwner && (
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            You must be a team owner to invite new members.
          </p>
        </CardFooter>
      )}
    </Card>
  );
}


function CreateUser({ onUserCreated }: { onUserCreated?: () => void }) {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const { data: socialMediaData } = useSWR('/api/social-media', fetcher);
  const isOwner = user?.role === 'owner';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedSocialGroups, setSelectedSocialGroups] = useState<string[]>([]);

  // Don't render anything if user is not an owner
  if (!isOwner) {
    return null;
  }

  const handleSocialGroupChange = (groupId: string, checked: boolean) => {
    if (checked) {
      setSelectedSocialGroups(prev => [...prev, groupId]);
    } else {
      setSelectedSocialGroups(prev => prev.filter(id => id !== groupId));
    }
  };

  const handleSubmitWithState = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role, socialGroups: selectedSocialGroups }),
      });

      const result = await response.json();

      if (response.ok) {
        // Reset form
        (e.target as HTMLFormElement).reset();
        setSelectedSocialGroups([]);
        setMessage({ type: 'success', text: 'Користувача успішно створено!' });
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
        // Update the users list
        onUserCreated?.();
      } else {
        setMessage({ type: 'error', text: result.error || 'Помилка створення користувача' });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setMessage({ type: 'error', text: 'Виникла помилка при створенні користувача' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b">
        <CardTitle className="text-xl font-semibold text-gray-800">Новий користувач</CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <div className={`mb-4 p-3 rounded-md ${message.type === 'success'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmitWithState} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-2">
              Ім'я
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Введіть ім'я"
              required
            />
          </div>
          <div>
            <Label htmlFor="email" className="mb-2">
              Електронна пошта
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Введіть електронну пошту"
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="mb-2">
              Пароль
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Введіть пароль"
              required
              minLength={6}
            />
          </div>

          <div>
            <Label>Напрямки</Label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {(() => {
                // Extract unique customers from integrations
                const uniqueCustomers = socialMediaData?.integrations ?
                  [...new Map(
                    socialMediaData.integrations
                      .filter((integration: any) => integration.customer)
                      .map((integration: any) => [
                        integration.customer.id,
                        {
                          id: integration.customer.id,
                          name: integration.customer.name,
                          integrations: socialMediaData.integrations.filter((int: any) =>
                            int.customer?.id === integration.customer.id
                          )
                        }
                      ])
                  ).values()] : [];

                return uniqueCustomers.map((customer: any) => (
                  <div key={customer.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`customer-${customer.id}`}
                      checked={selectedSocialGroups.includes(customer.id)}
                      onChange={(e) => handleSocialGroupChange(customer.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`customer-${customer.id}`} className="text-sm">
                      {customer.name}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({customer.integrations.length} інтеграцій)
                      </span>
                    </Label>
                  </div>
                ));
              })()}
              {!socialMediaData?.integrations && (
                <p className="text-sm text-muted-foreground">Завантаження напрямків...</p>
              )}
            </div>
          </div>
          <div>
            <Label>Роль</Label>
            <RadioGroup
              defaultValue="member"
              name="role"
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="member" id="create-member" />
                <Label htmlFor="create-member">Member</Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="owner" id="create-owner" />
                <Label htmlFor="create-owner">Owner (має права на створення, видалення користувачів)</Label>
              </div>
            </RadioGroup>
          </div>
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Створення...
              </>
            ) : (
              'Створити користувача'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function UserManagement() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const isOwner = user?.role === 'owner';
  const { data: users, error, isLoading, mutate } = useSWR<User[]>(
    '/api/users',
    fetcher
  );

  const handleUserCreated = () => {
    mutate(); // Refresh the users list
  };

  // Don't render anything if user is not an owner
  if (!isOwner) {
    return <p className="text-red-500">Доступ заборонено. Тільки власники можуть переглядати всіх користувачів.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Users List - Full Width */}
      <AllUsers
        users={users}
        error={error}
        isLoading={isLoading}
        onUserDeleted={handleUserCreated}
      />

      {/* Create User Form */}
      <CreateUser onUserCreated={handleUserCreated} />
    </div>
  );
}

function AllUsers({ users, error, isLoading, onUserDeleted }: {
  users?: User[];
  error?: any;
  isLoading: boolean;
  onUserDeleted?: () => void;
}) {
  const { data: socialMediaData } = useSWR('/api/social-media', fetcher);
  const { data: currentUser } = useSWR<User>('/api/user', fetcher);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const getCustomerName = (customerId: string) => {
    const customer = socialMediaData?.integrations
      ?.find((int: any) => int.customer?.id === customerId)?.customer;
    return customer ? customer.name : customerId;
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Ви впевнені, що хочете видалити користувача "${userName}"?`)) {
      return;
    }

    setDeletingUserId(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        alert('Користувача успішно видалено!');
        onUserDeleted?.();
      } else {
        alert(result.error || 'Помилка видалення користувача');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Виникла помилка при видаленні користувача');
    } finally {
      setDeletingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Всі користувачі</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Всі користувачі</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            {error.status === 403
              ? 'Доступ заборонено. Тільки власники команди можуть переглядати всіх користувачів.'
              : 'Помилка завантаження користувачів'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Всі користувачі</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Користувачі не знайдені</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Всі користувачі
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {users.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Ім'я</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Електронна пошта</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Роль</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Напрямки</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Створено</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Дії</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={`border-b border-gray-100 transition-colors ${user.role === 'owner'
                  ? 'bg-red-50/50 hover:bg-red-100/70'
                  : 'hover:bg-gray-50'
                  }`}>
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-900">
                      {user.name || 'Без імені'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{user.email}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${user.role === 'owner'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-blue-100 text-blue-800'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.socialGroups && user.socialGroups.length > 0 ? (
                        user.socialGroups.map((customerId: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            title={customerId}
                          >
                            {getCustomerName(customerId)}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">Немає</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    {user.id !== currentUser?.id ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                        disabled={deletingUserId === user.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                      >
                        {deletingUserId === user.id ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Видалення...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-1 h-3 w-3" />
                            Видалити
                          </>
                        )}
                      </Button>
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        Ваш акаунт
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">

        <div className="space-y-8">
          {/* Users List - Full Width */}
          <Suspense>
            <UserManagement />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
