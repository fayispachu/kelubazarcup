# Admin Broadcast Video Preview - Setup Complete ✅

## What Was Fixed

The admin broadcast panel now **properly displays the live camera preview** so the admin can verify camera positioning before streaming to viewers.

### The Problem
The video preview box wasn't displaying the camera feed even when the camera stream was available, due to a React state/mounting timing issue.

### The Solution
Added a `useEffect` hook that ensures the camera stream is properly synced with the video element after it's mounted in the DOM. This fixes the race condition between React state updates and the video element lifecycle.

---

## How to Use

### Step 1: Navigate to Admin Dashboard
- Go to `/admin`
- Log in with admin credentials

### Step 2: Enable Camera
1. Click the **"Camera live"** button
2. Browser will request camera permission
3. **Click "Allow"** when prompted

### Step 3: View Preview
Once permission is granted:
- The preview box will show your **live camera feed**
- You can see in real-time what the viewers will see
- Adjust your camera position and angle as needed
- Verify lighting and framing are correct

### Step 4: Go Live to Viewers
Once you're satisfied with the camera positioning:
1. Click **"Save match"** to confirm the broadcast is ready
2. The camera feed is now being broadcast to all viewers
3. The viewer count at the top shows how many people are watching

### Step 5: Stop Broadcasting
1. Click **"End live"** button to stop the broadcast
2. Camera feed will be disconnected
3. Viewers will see "Live stream has ended"

---

## Features

✅ **Live Preview** - See exactly what viewers see  
✅ **Camera Positioning** - Verify setup before going live  
✅ **Screen Sharing** - Alternative to camera (click "Screen live")  
✅ **Viewer Count** - See how many people are watching  
✅ **HD Quality** - Broadcasts at 1920x1080 @ 30fps  
✅ **Auto-Stop** - Automatically stops if camera disconnects  

---

## Troubleshooting

### Preview doesn't show after clicking "Camera live"
1. **Check browser permissions** - Click the lock icon in the address bar
2. **Grant camera permission** - Allow access to Camera and Microphone
3. **Refresh page** and try again
4. **Check camera device** - Ensure camera is connected and not in use by another app

### Video is black/blank
1. **Check lighting** - Ensure adequate lighting on subject
2. **Check camera lens** - Clean the lens if dirty
3. **Verify camera driver** - Update camera drivers on Windows

### Audio not working
1. **Check microphone** - System settings → Privacy → Microphone
2. **Ensure permission granted** - Allow microphone access in browser
3. **Test microphone** - System Settings → Sound → Microphone

---

## Technical Details

**File Modified:** `src/components/admin-broadcast-panel.tsx`

**Key Changes:**
- Added `useEffect` to sync video stream with element after mount
- Improved error message display
- Stream is now properly attached via `srcObject` in the correct lifecycle phase

**Browser Support:**
- Chrome/Edge 60+
- Firefox 55+
- Safari 11+
- Opera 47+

---

## Files Involved
- Admin Panel: `src/components/admin-broadcast-panel.tsx`
- Admin Dashboard: `src/components/admin-dashboard.tsx`
- API Routes: `src/app/api/admin/broadcast/`
- Database Models: `src/models/LiveMatch.ts`

---

**Setup Date:** 2026-06-30  
**Status:** ✅ Ready to Use
