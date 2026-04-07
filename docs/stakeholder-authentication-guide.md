# GSFP Stakeholder Authentication Guide

## Overview

The Ghana School Feeding Programme (GSFP) admin dashboard provides a comprehensive authentication system designed specifically for government stakeholders who need to manage content, events, and program information.

## 🔐 Authentication Flow

### How Admin Dashboard Works

1. **Access Point**: Users navigate to `/admin` or `/admin/register`
2. **Login Page**: Firebase Authentication with email/password or Google OAuth
3. **Role Assignment**: Automatic role-based permissions based on stakeholder type
4. **Dashboard Access**: Role-based access to admin features

```
Visit /admin → Login/Register → Firebase Auth → Role Assignment → Dashboard Access
```

## 👥 Stakeholder Roles & Permissions

### Role Hierarchy

| Role | Description | Primary Responsibilities |
|------|-------------|-------------------------|
| **🔴 Admin** | System Administrator | User management, full system access |
| **🟡 Editor** | Content Editor | Create, edit, publish content |
| **🟢 Coordinator** | Event Coordinator | Manage events and calendar |
| **🔵 Viewer** | Report Viewer | View analytics and reports |
| **🟠 Content Creator** | Content Specialist | Create content and upload media |
| **🟣 Event Manager** | Event Specialist | Schedule and manage events |
| **🟦 Program Officer** | Program Manager | Manage programs and partners |

### Permission Matrix

| Permission | Admin | Editor | Coordinator | Viewer | Content Creator | Event Manager | Program Officer |
|-----------|-------|--------|-------------|--------|----------------|-------------|----------------|
| Create Content | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Edit Content | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Publish Content | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Content | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Events | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Upload Media | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Partners | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Update Programs | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Schedule Events | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |

## 🏛️ Government Stakeholder Types

### Content Management Team
- **Role**: Editor or Content Creator
- **Responsibilities**: 
  - Create and publish news articles
  - Upload photos and videos
  - Update program information
  - Manage content calendar
- **Access**: Content Manager, Media Upload, Analytics

### Event Management Team
- **Role**: Coordinator or Event Manager
- **Responsibilities**:
  - Schedule workshops and meetings
  - Manage event registrations
  - Update event calendar
  - Coordinate with stakeholders
- **Access**: Event Management, Calendar Updates, Analytics

### Program Management Team
- **Role**: Program Officer or Editor
- **Responsibilities**:
  - Update program information
  - Manage partner organizations
  - Create progress reports
  - Coordinate with ministries
- **Access**: Content Updates, Partner Management, Programs

### IT Administration
- **Role**: Admin
- **Responsibilities**:
  - User account management
  - System configuration
  - Security oversight
  - Technical support
- **Access**: Full system access, User Creation

### Ministry Officials
- **Role**: Viewer or Editor
- **Responsibilities**:
  - View analytics and reports
  - Review content before publishing
  - Monitor program progress
- **Access**: Analytics, Reports, Limited Content

## 📋 Registration Process

### Required Information

1. **Personal Information**
   - Full name
   - Email address (government domain preferred)
   - Phone number (optional)

2. **Professional Information**
   - Department/Agency
   - Position/Title
   - Role selection based on responsibilities

3. **Account Security**
   - Password (minimum 6 characters)
   - Email verification

### Department Options

- Ministry of Gender, Children and Social Protection
- Ghana School Feeding Programme
- Ministry of Education
- Ministry of Health
- Ministry of Finance
- Regional Education Office
- District Education Office
- Partner Organizations

## 🚀 Getting Started

### For New Stakeholders

1. **Register Account**
   - Visit `/admin/register`
   - Fill in required information
   - Select appropriate role
   - Wait for admin approval (if required)

2. **First Login**
   - Use email and password
   - Complete email verification
   - Update profile information

3. **Dashboard Access**
   - Navigate to assigned sections
   - Start managing content/events
   - Access analytics and reports

### For Administrators

1. **User Management**
   - Create stakeholder accounts
   - Assign appropriate roles
   - Manage user permissions
   - Monitor user activity

2. **System Configuration**
   - Configure Firebase settings
   - Set up security rules
   - Manage environment variables
   - Monitor system health

## 🔒 Security Features

### Authentication Methods
- **Email/Password**: Traditional login with government email
- **Google OAuth**: Single sign-on with government accounts
- **Password Reset**: Secure password recovery via email

### Security Measures
- **Role-Based Access**: Users only see features they're authorized to use
- **Session Management**: Automatic logout after inactivity
- **Email Verification**: Required for account activation
- **Firebase Security Rules**: Database-level access control

### Data Protection
- **Encrypted Storage**: All data encrypted in transit and at rest
- **Access Logs**: Comprehensive audit trail of user activities
- **Permission Checks**: Server-side validation of all actions
- **Secure APIs**: Protected endpoints with token authentication

## 📱 Route Access Control

### Route Permissions

| Route | Required Roles | Description |
|-------|---------------|-------------|
| `/` | All Roles | Main dashboard |
| `/content` | Admin, Editor, Content Creator | Content management |
| `/events` | Admin, Coordinator, Event Manager | Event management |
| `/analytics` | All Roles except Content Creator | Analytics and reports |
| `/partners` | Admin, Program Officer | Partner management |
| `/programs` | Admin, Program Officer | Program management |
| `/settings` | Admin | System settings |
| `/users` | Admin | User management |

### Access Denied Handling
- Users redirected to appropriate dashboard
- Clear error messages for insufficient permissions
- Option to contact administrator for access requests

## 🛠️ Technical Implementation

### Firebase Integration
```typescript
// Authentication
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// User Profile Storage
const stakeholderProfile = {
  name: 'John Doe',
  role: 'editor',
  department: 'GSFP',
  position: 'Content Manager',
  permissions: rolePermissions['editor']
};
```

### Role-Based Components
```typescript
// Permission Checking
const { hasPermission } = useStakeholderAuth();

if (hasPermission('canCreateContent')) {
  // Show create content button
}

// Route Protection
const { canAccessRoute } = useStakeholderAuth();

if (!canAccessRoute('/users')) {
  return <Navigate to="/" />;
}
```

## 📊 Analytics & Monitoring

### User Activity Tracking
- Login/logout timestamps
- Content creation/editing history
- Event management activities
- Permission changes

### System Metrics
- Active user count by role
- Most used features by department
- Content creation frequency
- Event scheduling patterns

## 🔧 Troubleshooting

### Common Issues

1. **Cannot Login**
   - Check email and password
   - Verify email is confirmed
   - Contact administrator for account issues

2. **Missing Permissions**
   - Verify role assignment
   - Check with administrator
   - Request role change if needed

3. **Registration Problems**
   - Ensure all required fields are filled
   - Check email format (government domain preferred)
   - Verify password meets requirements

### Support Contact
- **Technical Support**: IT Administrator
- **Account Issues**: System Administrator
- **Role Changes**: Department Head
- **Training Requests**: Program Coordinator

## 📋 Best Practices

### For Stakeholders
- Use government email addresses when possible
- Choose appropriate role based on actual responsibilities
- Keep passwords secure and unique
- Log out when finished using the system
- Report suspicious activity immediately

### For Administrators
- Regularly review user accounts and roles
- Monitor system access logs
- Keep user permissions up to date
- Provide training for new stakeholders
- Maintain backup of user data

### Security Guidelines
- Never share login credentials
- Use strong, unique passwords
- Enable two-factor authentication when available
- Report security incidents immediately
- Follow government data protection policies

---

## 📞 Support

For technical support or questions about the authentication system:

- **Email**: admin@gsfp.gov.gh
- **Phone**: +233 XXX XXX XXXX
- **Help Desk**: Available Monday-Friday, 8AM-5PM

---

*This guide is maintained by the GSFP Technical Team and updated regularly to reflect system changes and user feedback.*
