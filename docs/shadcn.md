### Step 1: Initialize shadcn/ui & Install Components
Run the necessary terminal commands to initialize shadcn/ui (using default style, slate base color, and CSS variables enabled). Once initialized, add the following components: card, table, badge, avatar, button, input, and dropdown-menu.

### Step 2: Apply the Custom Theme
Overwrite the contents of `app/globals.css` with the following custom theme. This ensures shadcn/ui aligns with our YFC-BonEagle brand colors:

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}
@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}

### Step 3: Build the Dashboard Layout
Create `app/admin/(console)/layout.tsx`. It should include a top navigation bar with a placeholder logo on the left, a global search input in the middle, and a User Avatar Dropdown on the right. Render `{children}` below the top nav.

### Step 4: Build the Main Dashboard Page
Create `app/admin/(console)/page.tsx` as a React Server Component. 
1. Create a mock async data fetching function at the top of the file that returns high-level metrics (Total Responses, Completion Rate, Qualified POLAN Leads, Active Sessions) and an array of 4-5 recent leads (including ID, Hotel Name, Contact, Date, and Status).
2. Render a 4-column grid of shadcn Cards displaying the high-level metrics.
3. Below the metrics, render a full-width shadcn Card containing a Table. Map over the recent leads array to display the lead data, using shadcn Badges for the Status column.

Ensure the final code is clean, responsive, and matches the visual style of the official shadcn dashboard examples.