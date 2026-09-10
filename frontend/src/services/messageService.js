export const messagesData = [
  {
    id: 'msg-1',
    sender: 'Amit Sharma',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    lastMessage: "Hey! How's the progress?",
    timestamp: '10:30 AM',
    unread: true,
    online: true,
    project: 'E-Commerce Website',
  },
  {
    id: 'msg-2',
    sender: 'Neha Verma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'Thanks! Waiting for your feedback.',
    timestamp: 'Yesterday',
    unread: false,
    online: false,
    project: 'Social Media App',
  },
  {
    id: 'msg-3',
    sender: 'Rohan Mehta',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    lastMessage: "I've completed the rough cut.",
    timestamp: '2 days ago',
    unread: false,
    online: true,
    project: 'YouTube 4K Documentary Cut',
  },
  {
    id: 'msg-4',
    sender: 'Sophia Martinez',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'Color grading palette has been uploaded!',
    timestamp: '3 days ago',
    unread: false,
    online: false,
    project: 'Travel Vlog Episode',
  }
];

export const messageService = {
  getMessages: () => Promise.resolve(messagesData),
};
