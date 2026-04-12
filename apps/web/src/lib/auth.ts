export type UserRole = "admin" | "advisor" | "student";

export interface User {
  id: string;
  studentId: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

const USERS_KEY = "practicum_users";
const SESSION_KEY = "practicum_session";

export function initializeUsers(): User[] {
  if (typeof window === "undefined") return [];
  
  const existing = localStorage.getItem(USERS_KEY);
  if (existing) {
    return JSON.parse(existing);
  }
  
  const defaultUsers: User[] = [
    {
      id: "1",
      studentId: "admin",
      password: "admin123",
      name: "System Admin",
      email: "admin@stimarikina.edu.ph",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      studentId: "advisor1",
      password: "advisor123",
      name: "Ms. Rodriguez",
      email: "rodriguez@stimarikina.edu.ph",
      role: "advisor",
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      studentId: "student1",
      password: "student123",
      name: "John Dwayne B. Guaniso",
      email: "jdguaniso@stimarikina.edu.ph",
      role: "student",
      createdAt: new Date().toISOString(),
    },
  ];
  
  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
}

export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : initializeUsers();
}

export function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function createUser(user: Omit<User, "id" | "createdAt">): User | null {
  const users = getUsers();
  
  if (users.some(u => u.studentId === user.studentId)) {
    return null;
  }
  
  const newUser: User = {
    ...user,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function deleteUser(id: string): boolean {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length === users.length) return false;
  saveUsers(filtered);
  return true;
}

export function login(studentId: string, password: string): User | null {
  const users = getUsers();
  const user = users.find(u => u.studentId === studentId && u.password === password);
  
  if (user) {
    setSession(user);
    return user;
  }
  return null;
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function setSession(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
}

export function getCurrentRole(): UserRole | null {
  const session = getSession();
  return session?.role || null;
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}