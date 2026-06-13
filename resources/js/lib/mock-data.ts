export const currentUser = {
  id: "u_001",
  name: "Tahmid Rahman",
  email: "tahmid.rahman@stud.kuet.ac.bd",
  roll: "1907042",
  department: "CSE",
  batch: "'19",
  gender: "Male",
  bio: "Final-year CSE @ KUET. Distributed systems nerd. Maintains lecture notes for CSE 4203.",
  avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=tahmid",
  cover: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1200&q=60",
  contact: "+880 1700 000042",
  social: { github: "tahmidr", linkedin: "tahmid-r" },
  score: 2840,
  rank: "Top Contributor",
  joinedAt: "2024-08-12",
};

export const stats = {
  totalAds: 14,
  activeListings: 6,
  sold: 8,
  resources: 22,
  downloads: 348,
  bloodPosts: 3,
  exchanges: 4,
  roommatePosts: 1,
  profileViews: 1284,
  score: 2840,
};

export const quickActions = [
  { key: "listing", label: "List for sale", to: "/app/marketplace/new", icon: "Tag" },
  { key: "resource", label: "Upload resource", to: "/app/resources/new", icon: "FileUp" },
  { key: "exchange", label: "Post exchange", to: "/app/exchange/new", icon: "RefreshCw" },
  { key: "blood", label: "Blood request", to: "/app/blood/new", icon: "Droplet" },
  { key: "roommate", label: "Find roommate", to: "/app/roommates/new", icon: "Home" },
  { key: "profile", label: "Edit profile", to: "/app/profile", icon: "UserCog" },
] as const;

export const recentActivity = [
  { id: 1, type: "sale", text: "Sold Casio FX-991EX to Anika Tasnim", time: "2h ago" },
  { id: 2, type: "resource", text: "Uploaded 'OS Process Sync Notes' to CSE 3201", time: "5h ago" },
  { id: 3, type: "exchange", text: "Exchange request received on Logic Pro book", time: "1d ago" },
  { id: 4, type: "blood", text: "Marked yourself as available B+ donor", time: "2d ago" },
  { id: 5, type: "badge", text: "Earned 'Resource Contributor' badge", time: "3d ago" },
];

export const announcements = [
  {
    id: "a1",
    title: "Mid-term exam schedule released for Spring 2026",
    excerpt: "Department of CSE has published the revised mid-term schedule. Examinations begin Feb 18.",
    category: "Academic",
    pinned: true,
    featured: true,
    date: "Jun 09, 2026",
    author: "Office of the Registrar",
  },
  {
    id: "a2",
    title: "KUET ECE Fest 2026 — Registration open",
    excerpt: "Three days of robotics, circuits, and the annual project showcase. Early-bird until Jun 20.",
    category: "Event",
    pinned: true,
    featured: false,
    date: "Jun 08, 2026",
    author: "ECE Club",
  },
  {
    id: "a3",
    title: "Library extended hours during finals week",
    excerpt: "Central library will remain open until 2:00 AM from Jun 22 through Jul 06.",
    category: "Notice",
    pinned: false,
    featured: false,
    date: "Jun 07, 2026",
    author: "Central Library",
  },
  {
    id: "a4",
    title: "Emergency: Power outage scheduled — Jun 14, 10am–2pm",
    excerpt: "Maintenance work in Hall-3 and Hall-4 will require a planned shutdown.",
    category: "Emergency",
    pinned: false,
    featured: false,
    date: "Jun 06, 2026",
    author: "Estate Office",
  },
];

export const notifications = [
  { id: "n1", type: "exchange", title: "Anika requested your Logic Pro book", time: "12m ago", unread: true },
  { id: "n2", type: "blood", title: "Urgent: B+ needed at Khulna Medical College", time: "1h ago", unread: true },
  { id: "n3", type: "resource", title: "Your CSE 3201 notes hit 100 downloads", time: "3h ago", unread: true },
  { id: "n4", type: "report", title: "Your report on a fake listing was resolved", time: "1d ago", unread: false },
  { id: "n5", type: "system", title: "Welcome to CampusOS — your account is verified", time: "Aug 12", unread: false },
];

export const marketplaceListings = [
  { id: "m1", title: "Casio FX-991EX (Pristine)", price: 1450, condition: "Like new", category: "Academic", seller: "Tahmid R.", department: "CSE '19", image: "https://images.unsplash.com/photo-1574607383476-f517f260d30b?w=600&q=70", sold: false, location: "Hall-3" },
  { id: "m2", title: "Keychron K2 v2 Mechanical", price: 6500, condition: "Used 6 months", category: "Electronics", seller: "Anika T.", department: "EEE '20", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=70", sold: false, location: "Hall-4" },
  { id: "m3", title: "Cycle — Foxter MTB", price: 9200, condition: "Good", category: "Transport", seller: "Rafi H.", department: "ME '18", image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600&q=70", sold: false, location: "Off-campus" },
  { id: "m4", title: "Fluid Mechanics — Frank M. White", price: 480, condition: "Fair", category: "Books", seller: "Ifaz K.", department: "ME '19", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=70", sold: false, location: "Hall-1" },
  { id: "m5", title: "Logitech MX Master 3S", price: 7800, condition: "Like new", category: "Electronics", seller: "Sumaiya R.", department: "CSE '20", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=70", sold: false, location: "Hall-5" },
  { id: "m6", title: "Drafting Table (Foldable)", price: 2200, condition: "Good", category: "Furniture", seller: "Naimul I.", department: "Arch '17", image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=600&q=70", sold: true, location: "Off-campus" },
  { id: "m7", title: "Wacom Intuos Small", price: 4500, condition: "Excellent", category: "Electronics", seller: "Mehrab S.", department: "URP '19", image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=70", sold: false, location: "Hall-2" },
  { id: "m8", title: "Casio Scientific FX-100MS", price: 650, condition: "Good", category: "Academic", seller: "Sadia P.", department: "EEE '21", image: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600&q=70", sold: false, location: "Hall-7" },
];

export const marketplaceCategories = ["All", "Academic", "Electronics", "Books", "Transport", "Furniture", "Apparel", "Other"];

export const exchangePosts = [
  { id: "e1", offering: "Calculus by Stewart (8e)", desire: "Engineering Mathematics by Stroud", owner: "Tahmid R.", department: "CSE '19", status: "Open", image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=70" },
  { id: "e2", offering: "Casio FX-991EX", desire: "Casio FX-100MS + cash", owner: "Anika T.", department: "EEE '20", status: "Open", image: "https://images.unsplash.com/photo-1574607383476-f517f260d30b?w=500&q=70" },
  { id: "e3", offering: "Mechanical drawing T-square", desire: "Set of French curves", owner: "Naimul I.", department: "Arch '17", status: "Pending", image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=500&q=70" },
  { id: "e4", offering: "Arduino UNO R3 kit", desire: "Raspberry Pi 4 (any)", owner: "Rafi H.", department: "ME '18", status: "Completed", image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=500&q=70" },
];

export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const bloodRequests = [
  { id: "b1", group: "B+", units: 2, hospital: "Khulna Medical College Hospital", date: "Today, 9:00 PM", emergency: true, contact: "+880 1700 000001", status: "Active", posted: "12 min ago", department: "CSE '20", note: "Surgery scheduled. Donors needed urgently." },
  { id: "b2", group: "O-", units: 1, hospital: "Khulna City Medical College", date: "Tomorrow, 10:00 AM", emergency: false, contact: "+880 1700 000002", status: "Active", posted: "2 hours ago", department: "EEE '21", note: "For mother of student. Pre-arranged transfusion." },
  { id: "b3", group: "A+", units: 3, hospital: "Ad-din Akij Medical College", date: "Jun 14, 2026", emergency: false, contact: "+880 1700 000003", status: "Active", posted: "5 hours ago", department: "ME '19" },
  { id: "b4", group: "AB+", units: 1, hospital: "Khulna Medical College Hospital", date: "Jun 13, 2026", emergency: false, contact: "+880 1700 000004", status: "Fulfilled", posted: "1 day ago", department: "Arch '18" },
];

export const departments = ["CSE", "EEE", "ECE", "ME", "CE", "IPE", "MSE", "URP", "Arch", "BECM", "ChE", "LE", "MTE"];

export const resources = [
  { id: "r1", title: "Operating Systems — Process Synchronisation (Notes)", type: "Notes", course: "CSE 3201", department: "CSE", semester: "3-1", year: "2024", uploader: "Tahmid R.", downloads: 312, rating: 4.8, size: "2.4 MB" },
  { id: "r2", title: "Digital Logic Design — Slide Deck", type: "Slides", course: "EEE 2105", department: "EEE", semester: "2-1", year: "2023", uploader: "Sadia P.", downloads: 198, rating: 4.6, size: "8.1 MB" },
  { id: "r3", title: "Fluid Mechanics — Past Questions 2018-2023", type: "Question Bank", course: "ME 2203", department: "ME", semester: "2-2", year: "2024", uploader: "Ifaz K.", downloads: 540, rating: 4.9, size: "4.2 MB" },
  { id: "r4", title: "Microprocessor Lab Reports (Full Set)", type: "Lab Report", course: "CSE 3208", department: "CSE", semester: "3-2", year: "2024", uploader: "Anika T.", downloads: 89, rating: 4.4, size: "12.6 MB" },
  { id: "r5", title: "Data Structures — Solved Assignments", type: "Assignment", course: "CSE 2105", department: "CSE", semester: "2-1", year: "2023", uploader: "Rafi H.", downloads: 245, rating: 4.7, size: "1.8 MB" },
  { id: "r6", title: "Engineering Mechanics — Reference Book", type: "Book", course: "ME 1101", department: "ME", semester: "1-1", year: "2022", uploader: "Naimul I.", downloads: 421, rating: 4.5, size: "45 MB" },
];

export const resourceTypes = ["All", "Notes", "Slides", "Books", "Question Bank", "Assignment", "Lab Report"];

export const roommatePosts = [
  { id: "rm1", name: "Sumaiya R.", department: "CSE '20", budget: 4500, location: "Boyra, near KUET gate", lookingFor: "Female, non-smoker, quiet", lifestyle: ["Veg", "Early riser", "Quiet"], moveIn: "Jul 2026", status: "Open" },
  { id: "rm2", name: "Ifaz K.", department: "ME '19", budget: 6000, location: "Sonadanga", lookingFor: "Male, 4th-year, studious", lifestyle: ["Non-veg", "Night owl", "Gym"], moveIn: "Aug 2026", status: "Open" },
  { id: "rm3", name: "Naimul I.", department: "Arch '17", budget: 5500, location: "Khalishpur", lookingFor: "Any, creative crowd", lifestyle: ["Veg", "Quiet", "Music"], moveIn: "Sep 2026", status: "Closed" },
];

export const pendingRegistrations = [
  { id: "p1", name: "Anirban Roy", email: "anirban.roy@stud.kuet.ac.bd", roll: "2103042", department: "ME", batch: "'21", gender: "Male", submitted: "2 hours ago", idCard: "https://images.unsplash.com/photo-1554224155-1696413565d3?w=600&q=70" },
  { id: "p2", name: "Farhana Yasmin", email: "farhana.y@stud.kuet.ac.bd", roll: "2107015", department: "CSE", batch: "'21", gender: "Female", submitted: "5 hours ago", idCard: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=70" },
  { id: "p3", name: "Sajid Hossain", email: "sajid.h@stud.kuet.ac.bd", roll: "2009099", department: "EEE", batch: "'20", gender: "Male", submitted: "1 day ago", idCard: "https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?w=600&q=70" },
  { id: "p4", name: "Rumana Akter", email: "rumana.a@stud.kuet.ac.bd", roll: "2205033", department: "URP", batch: "'22", gender: "Female", submitted: "1 day ago", idCard: "https://images.unsplash.com/photo-1554224155-1696413565d3?w=600&q=70" },
];

export const adminUsers = [
  { id: "u1", name: "Tahmid Rahman", roll: "1907042", department: "CSE", batch: "'19", status: "Active", joined: "Aug 2024", contributions: 28 },
  { id: "u2", name: "Anika Tasnim", roll: "2005014", department: "EEE", batch: "'20", status: "Active", joined: "Sep 2024", contributions: 14 },
  { id: "u3", name: "Rafi Hasan", roll: "1809021", department: "ME", batch: "'18", status: "Suspended", joined: "Aug 2024", contributions: 8 },
  { id: "u4", name: "Sumaiya Rahman", roll: "2007033", department: "CSE", batch: "'20", status: "Active", joined: "Oct 2024", contributions: 19 },
  { id: "u5", name: "Ifaz Karim", roll: "1903055", department: "ME", batch: "'19", status: "Active", joined: "Aug 2024", contributions: 22 },
  { id: "u6", name: "Naimul Islam", roll: "1701022", department: "Arch", batch: "'17", status: "Banned", joined: "Aug 2024", contributions: 3 },
];

export const adminReports = [
  { id: "rp1", target: "Listing: 'iPhone 14 Pro - 8k only'", reporter: "Anika T.", reason: "Fraud", severity: "high", time: "1h ago", status: "Pending" },
  { id: "rp2", target: "Resource: 'CSE 3201 Final Solution'", reporter: "Sadia P.", reason: "Duplicate Content", severity: "low", time: "4h ago", status: "Pending" },
  { id: "rp3", target: "Profile: @rafi_h", reporter: "Tahmid R.", reason: "Spam", severity: "medium", time: "1d ago", status: "Resolved" },
  { id: "rp4", target: "Exchange: 'Sell-only post tagged as exchange'", reporter: "Ifaz K.", reason: "Fake Information", severity: "medium", time: "2d ago", status: "Pending" },
];

export const badges = [
  { key: "new", name: "New Contributor", description: "Made your first post", color: "info", earned: true },
  { key: "active", name: "Active Member", description: "Logged in 30 days running", color: "success", earned: true },
  { key: "resource", name: "Resource Contributor", description: "Shared 10+ resources", color: "primary", earned: true },
  { key: "seller", name: "Trusted Seller", description: "5+ successful sales", color: "warning", earned: true },
  { key: "helper", name: "Community Helper", description: "Helped 25+ students", color: "info", earned: false },
  { key: "blood", name: "Blood Donation Hero", description: "Responded to 3+ requests", color: "blood", earned: false },
  { key: "top", name: "Top Contributor", description: "Top 1% by reputation", color: "primary", earned: true },
];

export const adminAnalytics = {
  totalUsers: 4218,
  activeUsers: 1842,
  pendingRegistrations: 4,
  marketplaceItems: 612,
  resources: 1304,
  openReports: 3,
  weekly: [
    { day: "Mon", users: 230, posts: 42 },
    { day: "Tue", users: 312, posts: 58 },
    { day: "Wed", users: 289, posts: 47 },
    { day: "Thu", users: 365, posts: 71 },
    { day: "Fri", users: 412, posts: 88 },
    { day: "Sat", users: 198, posts: 33 },
    { day: "Sun", users: 156, posts: 21 },
  ],
};
