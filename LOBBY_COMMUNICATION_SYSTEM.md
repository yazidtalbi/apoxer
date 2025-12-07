# Lobby Communication & Team Formation System

## Overview

A comprehensive communication and team formation system for the matchmaking lobby, featuring in-app chat, Discord integration, and team/party management.

---

## Architecture Decision: Hybrid Communication Approach

### Why Hybrid?

**In-App Chat:**
- ✅ Quick coordination without leaving the app
- ✅ No external dependencies
- ✅ Integrated with lobby state
- ✅ Better UX flow (no context switching)
- ❌ Requires moderation system
- ❌ Limited to text-only

**Discord Integration:**
- ✅ Industry standard for gaming communication
- ✅ Rich features (voice, screen share, etc.)
- ✅ Established user base
- ✅ Built-in moderation
- ❌ Requires external app
- ❌ Context switching (leaves your app)

**Solution:** Use both! In-app chat for quick coordination, Discord for voice and deeper communication.

---

## Components Created

### 1. `LobbyChat` (`components/lobby/LobbyChat.tsx`)

**Purpose:** Lightweight in-app text chat for quick coordination.

**Features:**
- Real-time message display (simulated with polling)
- Minimizable chat interface
- User avatars with initials
- System messages (joins/leaves)
- Character limit (200 chars)
- Auto-scroll to latest messages
- Online user count display

**Dummy Data:**
- Pre-populated with 4 dummy users
- Sample messages from previous interactions
- Simulates new messages every 30 seconds (30% probability)

**Usage:**
```tsx
<LobbyChat
  gameId={game.id}
  currentUserId="user-123"
  currentUsername="PlayerName"
/>
```

---

### 2. `LobbyTeamFormation` (`components/lobby/LobbyTeamFormation.tsx`)

**Purpose:** Team/party creation and management interface.

**Features:**
- Create multiple teams
- Invite players from available list
- Team member management (add/remove)
- Ready check system
- Team leader designation (crown icon)
- Platform display per member
- Max team size (configurable, default: 4)
- Visual ready status indicators
- "All teams ready" notification

**Team Operations:**
- **Create Team:** Click "New Team" button
- **Invite Player:** Select from dropdown
- **Remove Member:** Leaders can remove members
- **Leave Team:** Button for current user
- **Toggle Ready:** Individual ready status

**Dummy Data:**
- Pre-populated with 2 sample teams
- Current user is leader of Team Alpha
- Sample members already in teams

**Usage:**
```tsx
<LobbyTeamFormation
  gameId={game.id}
  currentUserId="user-123"
  currentUsername="PlayerName"
  currentPlatform="PC"
  availablePlayers={playersArray}
/>
```

---

### 3. `DiscordIntegration` (`components/lobby/DiscordIntegration.tsx`)

**Purpose:** Discord server/voice channel integration.

**Features:**
- Discord server invite link
- Voice channel information
- Member count display
- Online count display
- Copy invite link functionality
- Direct join button (opens Discord)
- Discord branding colors (#5865F2)

**Dummy Data:**
- Server name: "{GameTitle} Lobby"
- Invite URL: "https://discord.gg/apoxer-lobby"
- Voice channel: "Voice Channel #1"
- Member count: 12 (8 online)

**Usage:**
```tsx
<DiscordIntegration
  gameId={game.id}
  gameTitle={game.title}
/>
```

---

## Integration Points

### LobbySidebar Integration

**Location:** `components/layout/LobbySidebar.tsx`

**Changes:**
- Added tabbed interface with 3 tabs:
  - **Players** (default): Existing player list
  - **Chat**: In-app messaging
  - **Discord**: Discord integration panel

**Tab Navigation:**
- Icon-based tabs for space efficiency
- Active tab highlighted with purple border
- Smooth transitions between tabs
- ARIA labels for accessibility

---

### LobbyModal Integration

**Location:** `components/game/LobbyModal.tsx`

**Changes:**
- Added tabbed interface with 2 tabs:
  - **Players** (default): Existing player list with connect functionality
  - **Teams**: Team formation interface

**Team Formation in Modal:**
- Full-featured team management
- Access to all available players
- Better screen real estate for team organization

---

## User Flow

### Starting Matchmaking

1. User selects game and starts matchmaking
2. Lobby sidebar appears on left
3. **Players tab** shows available players
4. User can:
   - Browse players
   - Open modal for detailed view
   - Switch to chat or Discord

### In-App Chat Flow

1. User clicks **Chat** tab in sidebar
2. Chat interface opens (minimizable)
3. User types message and sends
4. Messages appear in real-time
5. System messages show joins/leaves
6. User count shows online players

### Discord Integration Flow

1. User clicks **Discord** tab in sidebar
2. Discord panel shows:
   - Server name and member count
   - Voice channel information
   - Join/Copy buttons
3. User clicks "Join Discord" → Opens Discord app
4. User clicks copy button → Link copied to clipboard

### Team Formation Flow

1. User opens **Lobby Modal** → **Teams** tab
2. User creates a team (or joins existing)
3. User invites players from dropdown
4. Invited players accept and join team
5. Team members click "Ready" when prepared
6. System shows "All teams ready" when complete
7. Teams can start match together

---

## Dummy Data Structure

### Dummy Users (LobbyChat)

```typescript
const DUMMY_LOBBY_USERS = [
  { id: "user-1", username: "ProGamer123", status: "online" },
  { id: "user-2", username: "SniperElite", status: "online" },
  { id: "user-3", username: "TeamPlayer", status: "online" },
  { id: "user-4", username: "QuickShot", status: "away" },
];
```

### Dummy Messages (LobbyChat)

```typescript
const DUMMY_MESSAGES = [
  {
    id: "msg-1",
    userId: "user-1",
    username: "ProGamer123",
    message: "Hey everyone! Ready to start?",
    timestamp: Date,
    type: "message",
  },
  // ... more messages
];
```

### Dummy Teams (LobbyTeamFormation)

```typescript
const teams = [
  {
    id: "team-1",
    name: "Team Alpha",
    maxMembers: 4,
    members: [
      {
        userId: "current-user",
        username: "You",
        platform: "PC",
        isLeader: true,
        isReady: false,
      },
      // ... more members
    ],
  },
  // ... more teams
];
```

---

## Design Decisions

### Why Tabs in Sidebar?

- **Space Efficiency:** Sidebar is narrow (300px), tabs maximize content
- **Context Switching:** Easy to switch between communication methods
- **Visual Hierarchy:** Clear separation of features

### Why Teams in Modal?

- **Screen Real Estate:** Teams need more space for member management
- **Focus:** Modal creates focused environment for team creation
- **Discovery:** Modal can be opened from multiple places

### Why Both Chat and Discord?

- **Quick vs. Deep:** In-app for quick, Discord for voice
- **User Choice:** Some prefer in-app, others prefer Discord
- **Progressive Enhancement:** Start with in-app, upgrade to Discord

---

## Future Enhancements

### Phase 1 (Current)
- ✅ In-app text chat
- ✅ Discord integration
- ✅ Team formation
- ✅ Dummy data

### Phase 2 (Recommended)
- 🔄 WebSocket for real-time chat
- 🔄 Persistent chat history
- 🔄 Typing indicators
- 🔄 Message reactions
- 🔄 @mentions in chat

### Phase 3 (Advanced)
- 🔄 Voice chat integration (Discord SDK)
- 🔄 Screen sharing
- 🔄 In-game overlay
- 🔄 Push notifications for mentions
- 🔄 Chat moderation tools

---

## Accessibility

All components include:
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader support
- Semantic HTML

---

## Performance Considerations

- **Chat:** Messages limited to 200 characters
- **Polling:** Chat refreshes simulated (should use WebSocket)
- **Team Updates:** Optimistic UI updates
- **Lazy Loading:** Teams only load when tab is active

---

## Testing Recommendations

1. **Chat:**
   - Send messages
   - Minimize/maximize
   - Long messages (truncation)
   - System messages

2. **Teams:**
   - Create multiple teams
   - Invite/remove members
   - Ready check flow
   - Leave team

3. **Discord:**
   - Copy link functionality
   - Join button (opens Discord)
   - Member count updates

---

## Conclusion

This hybrid communication system provides flexibility for users while maintaining a clean, integrated experience. The combination of in-app chat, Discord integration, and team formation covers all major use cases for multiplayer matchmaking.

