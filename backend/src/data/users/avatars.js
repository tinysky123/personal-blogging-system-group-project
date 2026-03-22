export const PREDEFINED_AVATARS = [
  { id: 1, name: 'Ocar', path: '/images/avatars/ocar.png' },
  { id: 2, name: 'Panda', path: '/images/avatars/panda.png' },
  { id: 3, name: 'Kea', path: '/images/avatars/kea.png' },
  { id: 4, name: 'Penguin', path: '/images/avatars/penguin.png' },
  { id: 5, name: 'Cat', path: '/images/avatars/cat.png' },
  { id: 6, name: 'Dog', path: '/images/avatars/dog.png' },
  { id: 7, name: 'Eagle', path: '/images/avatars/eagle.png' },
  { id: 8, name: 'Rabbit', path: '/images/avatars/rabbit.png' },
  { id: 9, name: 'Tiger', path: '/images/avatars/tiger.png' },
  { id: 10, name: 'Dolphin', path: '/images/avatars/dolphin.png' }
];

// default avatar id for database if not provided
export const DEFAULT_AVATAR_ID = 1;

// helper: map avatar id to image path
export function getAvatarPathById(id) {
  const avatar = PREDEFINED_AVATARS.find(a => a.id === id);
  return avatar ? avatar.path : '/images/avatars/default.png';
}