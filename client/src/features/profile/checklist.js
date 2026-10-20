/** Each item is one thing that makes a profile easier for a project owner to trust. Built from the real user record. */
export function profileChecklist(user) {
  const skills = user?.skills ?? [];
  return [
    { label: 'Add a short bio', done: Boolean(user?.bio) },
    { label: 'Say where you are based', done: Boolean(user?.location) },
    { label: 'List at least three skills', done: skills.length >= 3 },
    { label: 'Link your GitHub', done: Boolean(user?.githubUsername) },
    { label: 'Add your LinkedIn or portfolio', done: Boolean(user?.linkedinUrl || user?.portfolioUrl) },
    { label: 'Add a profile image', done: Boolean(user?.avatarUrl) },
  ];
}
