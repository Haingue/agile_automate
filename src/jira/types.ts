export type JiraApi = {
  baseUrl: string;
  token: string;
  spaceKey: string;
};

export interface Status {
  self?: string;
  description?: string;
  iconUrl?: string;
  name?: string;
  id: string;
  statusCategory?: StatusCategory;
}

export interface StatusCategory {
  id: number;
  key: string;
  self?: string;
  colorName?: string;
  name?: string;
}

export interface Priority {
  self?: string;
  iconUrl?: string;
  name?: string;
  id: string;
}

export interface Issuetype {
  self?: string;
  id: string;
  description?: string;
  iconUrl?: string;
  name?: string;
  subtask?: boolean;
  avatarId?: number;
  hierarchyLevel?: number;
}

export interface Assignee {
  accountId: string;
  self?: string;
  emailAddress?: string;
  avatarUrls?: any;
  displayName?: string;
  active?: boolean;
  timeZone?: string;
  accountType?: string;
}

export interface Votes {
  self: string;
  votes: number;
  hasVoted: boolean;
}

export interface Progress {
  progress: number;
  total: number;
}

export interface User {
  accountId: string;
  emailAddress?: string;
  self?: string;
  avatarUrls?: any;
  displayName?: string;
  active?: boolean;
  timeZone?: string;
  accountType?: string;
}

export interface Worklog {
  startAt?: number;
  total?: number;
  worklogs?: any[];
  maxResults?: number;
}

export interface Project {
  self?: string;
  id: string;
  key: string;
  name?: string;
  projectTypeKey?: string;
  simplified?: boolean;
  avatarUrl0s?: any;
}

export type CutomField = {
  id: string;
  self?: string;
  value?: string;
};

export type Fields = {
  parent: Parent;
  project: Project;
  summary?: string;
  description?: any;
  labels?: string[];
  status?: Status;
  assignee?: Assignee;
  worklog?: Worklog;
  issuetype?: Issuetype;
  subtasks?: Issue[];
  duedate?: any;
  timeestimate?: any;
  aggregatetimeoriginalestimate?: any;
  aggregatetimeestimate?: any;
  progress?: Progress;
  comment?: Comment;
  timespent?: any;
  timeoriginalestimate?: any;
  aggregatetimespent?: any;
  statuscategorychangedate?: string;
  priority?: Priority;
  votes?: Votes;
  reporter?: User;
  creator?: User;
  created?: string;
  updated?: string;
  customfield_17537?: CutomField[]; // Shop
  customfield_17540?: CutomField[]; // Activiy type
};

export interface Parent {
  id: string;
  key: string;
  self?: string;
  fields?: any;
}

export type Issue = {
  id: string;
  key: string;
  self?: string;
  fields?: Fields;
  expand?: string;
};

export interface RemoteLink {
  id: number;
  self: string;
  globalId: string;
  application: Application;
  relationship: string;
  object: Link;
}

export interface Application {
  type: string;
  name: string;
}

export interface Link {
  url: string;
  title: string;
  icon: any;
  status: Status;
}
