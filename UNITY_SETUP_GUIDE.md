# 🎮 Farm & Give - Unity 3D Setup Guide

## 📱 Project Overview

**Game Name:** Farm & Give 3D
**Platform:** iOS (App Store)
**Style:** 3D Voxel/Pixelated
**Genre:** Farming Simulation with Social Impact

---

## 🛠️ Step 1: Unity Installation (IN PROGRESS)

### What You Need:
- **Unity Hub**: Launcher for Unity projects
- **Unity 2022.3 LTS**: The game engine
- **iOS Build Support**: To export to iPhone
- **Visual Studio**: Code editor

### Installation Steps:
1. ✅ Download Unity Hub from https://unity.com/download
2. ✅ Install Unity Hub
3. ✅ Open Unity Hub → Installs → Install Editor
4. ✅ Choose Unity 2022.3 LTS
5. ✅ Select modules:
   - iOS Build Support
   - Documentation
   - Visual Studio Community

**⏱️ Installation time: 10-20 minutes**

---

## 🎯 Step 2: Create New Unity Project

### Once Unity is Installed:

1. **Open Unity Hub**
2. Click **"New Project"**
3. Select **"3D Core"** template
4. **Project Settings:**
   - **Project Name:** `FarmAndGive3D`
   - **Location:** `C:\Users\OS NYC\CascadeProjects\FarmAndGive3D`
   - **Unity Version:** 2022.3 LTS
5. Click **"Create Project"**

**⏱️ First launch: 2-5 minutes**

---

## 📁 Project Structure

Unity will create this structure:

```
FarmAndGive3D/
├── Assets/                    # All game content goes here
│   ├── Scenes/               # Game levels/worlds
│   ├── Scripts/              # C# code
│   ├── Materials/            # Colors/textures
│   ├── Prefabs/              # Reusable objects
│   ├── Models/               # 3D models
│   ├── Audio/                # Sound effects/music
│   └── Resources/            # Loaded at runtime
├── Packages/                 # Unity packages
├── ProjectSettings/          # Unity configuration
└── Library/                  # Unity cache (auto-generated)
```

---

## 🎨 Step 3: Configure for Voxel/Pixelated Style

### Set Up Rendering:

1. **Edit → Project Settings → Quality**
   - Set **Anti Aliasing:** None (for pixelated look)
   - Set **Texture Quality:** Full Res

2. **Edit → Project Settings → Player**
   - **Company Name:** Your name/company
   - **Product Name:** Farm & Give
   - **Default Icon:** (we'll add later)

3. **Switch to iOS Platform:**
   - **File → Build Settings**
   - Select **iOS**
   - Click **"Switch Platform"**

---

## 📦 Step 4: Install Essential Packages

### Package Manager (Window → Package Manager):

**Install these packages:**

1. **ProBuilder** (for voxel building)
   - Window → Package Manager
   - Search "ProBuilder"
   - Click Install

2. **Cinemachine** (for camera control)
   - Search "Cinemachine"
   - Click Install

3. **Input System** (for mobile controls)
   - Search "Input System"
   - Click Install

---

## 🌍 Step 5: Create First Scene

### Set Up the World:

1. **Create Terrain:**
   - Right-click in Hierarchy
   - 3D Object → Plane (this will be ground)
   - Rename to "Ground"
   - Scale: X=10, Y=1, Z=10

2. **Add Lighting:**
   - GameObject → Light → Directional Light
   - Rename to "Sun"
   - Rotation: X=50, Y=-30, Z=0

3. **Set Up Camera:**
   - Select Main Camera
   - Position: X=0, Y=5, Z=-10
   - Rotation: X=20, Y=0, Z=0

4. **Save Scene:**
   - File → Save As
   - Name: "MainFarm"
   - Save in Assets/Scenes/

---

## 🎮 Step 6: Create Player Character

### Make a Simple Voxel Character:

1. **Create Character Object:**
   - GameObject → 3D Object → Cube
   - Rename to "Player"
   - Position: X=0, Y=1, Z=0
   - Scale: X=0.8, Y=1.2, Z=0.8 (body)

2. **Add Head:**
   - Right-click Player → 3D Object → Cube
   - Rename to "Head"
   - Position: X=0, Y=0.8, Z=0
   - Scale: X=0.6, Y=0.6, Z=0.6

3. **Add Color:**
   - Right-click in Assets → Create → Material
   - Name: "PlayerMaterial"
   - Set Albedo color (pick a fun color!)
   - Drag material onto Player and Head

---

## 💻 Step 7: Add Player Movement Script

### Create Movement Script:

1. **Create Script:**
   - Right-click in Assets/Scripts (create folder if needed)
   - Create → C# Script
   - Name: "PlayerController"

2. **Open Script** (double-click)

3. **Add this code:**

```csharp
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    public float moveSpeed = 5f;
    public float rotationSpeed = 10f;
    
    private CharacterController controller;
    
    void Start()
    {
        // Add CharacterController component
        controller = gameObject.AddComponent<CharacterController>();
        controller.height = 1.2f;
        controller.radius = 0.4f;
    }
    
    void Update()
    {
        // Get input
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        
        // Calculate movement
        Vector3 movement = new Vector3(horizontal, 0, vertical);
        movement = movement.normalized * moveSpeed * Time.deltaTime;
        
        // Move player
        controller.Move(movement);
        
        // Rotate player to face movement direction
        if (movement.magnitude > 0.1f)
        {
            Quaternion toRotation = Quaternion.LookRotation(movement, Vector3.up);
            transform.rotation = Quaternion.Lerp(transform.rotation, toRotation, rotationSpeed * Time.deltaTime);
        }
    }
}
```

4. **Save Script** (Ctrl+S)

5. **Attach to Player:**
   - Select Player in Hierarchy
   - Drag PlayerController script onto Player
   - OR click Add Component → Scripts → PlayerController

---

## 🎥 Step 8: Set Up Camera Follow

### Make Camera Follow Player:

1. **Create Camera Script:**
   - Assets/Scripts → Create → C# Script
   - Name: "CameraFollow"

2. **Add this code:**

```csharp
using UnityEngine;

public class CameraFollow : MonoBehaviour
{
    public Transform target;
    public Vector3 offset = new Vector3(0, 5, -10);
    public float smoothSpeed = 5f;
    
    void LateUpdate()
    {
        if (target != null)
        {
            Vector3 desiredPosition = target.position + offset;
            Vector3 smoothedPosition = Vector3.Lerp(transform.position, desiredPosition, smoothSpeed * Time.deltaTime);
            transform.position = smoothedPosition;
            
            transform.LookAt(target);
        }
    }
}
```

3. **Attach to Camera:**
   - Select Main Camera
   - Add Component → CameraFollow
   - Drag Player from Hierarchy to "Target" field

---

## ▶️ Step 9: Test Your Game!

### Play the Game:

1. **Click the Play button** (▶️) at top of Unity
2. **Use WASD or Arrow Keys** to move
3. **Camera should follow** your character
4. **Click Play again** to stop

**🎉 Congratulations! You have a working 3D character!**

---

## 🌾 Step 10: Add Voxel Ground Tiles

### Create Farmable Tiles:

1. **Create Tile Prefab:**
   - GameObject → 3D Object → Cube
   - Rename to "FarmTile"
   - Scale: X=1, Y=0.1, Z=1
   - Position: X=2, Y=0, Z=2

2. **Add Material:**
   - Create Material → "SoilMaterial"
   - Color: Brown (#8B4513)
   - Drag onto FarmTile

3. **Make it a Prefab:**
   - Drag FarmTile from Hierarchy to Assets/Prefabs/
   - Delete from Hierarchy

4. **Create Multiple Tiles:**
   - Drag FarmTile prefab into scene
   - Duplicate (Ctrl+D) and arrange in a grid

---

## 🌱 Next Steps (Coming Soon):

- ✅ Player movement (DONE!)
- ✅ Camera follow (DONE!)
- ✅ Voxel ground tiles (DONE!)
- 🔲 Crop planting system
- 🔲 30+ crop types
- 🔲 Weather system
- 🔲 Animal AI
- 🔲 Resource gathering
- 🔲 Inventory system
- 🔲 Backend API connection

---

## 📚 Helpful Resources:

### Unity Learn:
- https://learn.unity.com/
- Free tutorials for beginners

### Voxel Art:
- https://www.voxelart.com/
- Inspiration for pixelated 3D style

### Unity Asset Store:
- https://assetstore.unity.com/
- Free voxel assets, characters, animals

---

## 🆘 Troubleshooting:

### Player falls through ground:
- Add Rigidbody to Player
- Check "Is Kinematic"

### Camera doesn't follow:
- Make sure Target is assigned in CameraFollow script
- Check offset values

### Can't move:
- Make sure PlayerController is attached
- Check Input settings (Edit → Project Settings → Input Manager)

---

## 💡 Tips:

1. **Save Often:** Ctrl+S or File → Save
2. **Test Frequently:** Click Play button often
3. **Use Prefabs:** For reusable objects
4. **Organize:** Keep Assets folder organized
5. **Version Control:** Consider using Git

---

## 🎯 Current Status:

- ✅ Unity installed
- ✅ Project created
- ✅ Basic character
- ✅ Movement system
- ✅ Camera follow
- ⏳ Ready for farming mechanics!

**You're ready to build your 3D farming game!** 🌱🎮
