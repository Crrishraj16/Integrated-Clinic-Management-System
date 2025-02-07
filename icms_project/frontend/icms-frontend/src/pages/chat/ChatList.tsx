import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  TextField,
  IconButton,
  Badge,
  Chip,
  Grid,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { chatAPI } from '../../services/api';
import { Chat, Message, User } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';

const ChatList: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getAll();
      setChats(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: number) => {
    try {
      const response = await chatAPI.getMessages(chatId);
      setMessages(response.data);
    } catch (err) {
      setError('Failed to fetch messages');
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async () => {
    if (!selectedChat || (!newMessage.trim() && attachments.length === 0)) return;

    try {
      const formData = new FormData();
      formData.append('chat_id', selectedChat.id.toString());
      formData.append('content', newMessage);
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      await chatAPI.sendMessage(formData);
      setNewMessage('');
      setAttachments([]);
      fetchMessages(selectedChat.id);
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <ImageIcon />;
    }
    return <FileIcon />;
  };

  if (loading && chats.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Chat Support
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            <Box p={2}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Box>

            <List sx={{ flex: 1, overflow: 'auto' }}>
              {chats
                .filter((chat) =>
                  chat.participants.some((p) =>
                    p.full_name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                )
                .map((chat) => (
                  <React.Fragment key={chat.id}>
                    <ListItem
                      button
                      selected={selectedChat?.id === chat.id}
                      onClick={() => handleChatSelect(chat)}
                    >
                      <ListItemAvatar>
                        <Badge
                          color="primary"
                          variant="dot"
                          invisible={!chat.unread_count}
                        >
                          <Avatar src={chat.participants[0].avatar_url}>
                            {chat.participants[0].full_name[0]}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={chat.participants[0].full_name}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {chat.last_message?.content}
                            </Typography>
                            {' — '}
                            {format(new Date(chat.last_message?.created_at || ''), 'PPp')}
                          </>
                        }
                      />
                      {chat.unread_count > 0 && (
                        <Chip
                          label={chat.unread_count}
                          color="primary"
                          size="small"
                        />
                      )}
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {selectedChat ? (
            <Paper
              sx={{
                height: 'calc(100vh - 200px)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                p={2}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Avatar src={selectedChat.participants[0].avatar_url} sx={{ mr: 2 }}>
                  {selectedChat.participants[0].full_name[0]}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6">
                    {selectedChat.participants[0].full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedChat.participants[0].role}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column-reverse',
                }}
              >
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      flexDirection: message.is_sender ? 'row-reverse' : 'row',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        bgcolor: message.is_sender ? 'primary.main' : 'grey.100',
                        color: message.is_sender ? 'white' : 'inherit',
                        borderRadius: 2,
                        p: 2,
                      }}
                    >
                      <Typography variant="body1">{message.content}</Typography>
                      {message.attachments?.map((attachment, index) => (
                        <Button
                          key={index}
                          variant="outlined"
                          size="small"
                          startIcon={getFileIcon(attachment.name)}
                          href={attachment.url}
                          target="_blank"
                          sx={{ mt: 1, mr: 1 }}
                        >
                          {attachment.name}
                        </Button>
                      ))}
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1, opacity: 0.7 }}
                      >
                        {format(new Date(message.created_at), 'PPp')}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {attachments.length > 0 && (
                <Box
                  sx={{
                    p: 1,
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  {attachments.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      onDelete={() => handleRemoveAttachment(index)}
                      icon={getFileIcon(file.name)}
                    />
                  ))}
                </Box>
              )}

              <Box
                sx={{
                  p: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelected}
                />
                <IconButton onClick={handleAttachFile}>
                  <AttachFileIcon />
                </IconButton>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  multiline
                  maxRows={4}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && attachments.length === 0}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Paper>
          ) : (
            <Paper
              sx={{
                height: 'calc(100vh - 200px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Select a chat to start messaging
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChatList;
