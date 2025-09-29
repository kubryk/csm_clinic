import { db } from './drizzle';
import { users, teams, teamMembers } from './schema';
import { hashPassword } from '@/lib/auth/session';


async function seed() {
  const email = 'csmclinic_dev@hotmail.com';
  const password = 'csmclinicdev65535kyiv';
  const passwordHash = await hashPassword(password);

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  let user;
  if (existingUser) {
    console.log('User already exists, skipping user creation.');
    user = existingUser;
  } else {
    [user] = await db
      .insert(users)
      .values([
        {
          email: email,
          passwordHash: passwordHash,
          role: "owner",
        },
      ])
      .returning();
    console.log('Initial user created.');
  }

  // Check if team already exists
  const existingTeam = await db.query.teams.findFirst({
    where: (teams, { eq }) => eq(teams.name, 'Test Team'),
  });

  let team;
  if (existingTeam) {
    console.log('Team already exists, skipping team creation.');
    team = existingTeam;
  } else {
    [team] = await db
      .insert(teams)
      .values({
        name: 'Test Team',
      })
      .returning();
    console.log('Test team created.');
  }

  // Check if team member already exists
  const existingMember = await db.query.teamMembers.findFirst({
    where: (teamMembers, { and, eq }) => and(
      eq(teamMembers.teamId, team.id),
      eq(teamMembers.userId, user.id)
    ),
  });

  if (!existingMember) {
    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: user.id,
      role: 'owner',
    });
    console.log('Team member created.');
  } else {
    console.log('Team member already exists, skipping.');
  }
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
