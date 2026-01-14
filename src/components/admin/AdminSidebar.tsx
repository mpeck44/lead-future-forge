import { LayoutDashboard, BookOpen, Users, ArrowLeft } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const adminNavItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Courses', url: '/admin/courses', icon: BookOpen },
  { title: 'Users', url: '/admin/users', icon: Users },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar
      className="border-r border-slate-700 bg-slate-900"
      collapsible="icon"
    >
      <SidebarContent className="bg-slate-900">
        <div className="p-4 border-b border-slate-700">
          <h1 className={`font-display font-bold text-white transition-all ${collapsed ? 'text-sm' : 'text-xl'}`}>
            {collapsed ? 'A' : 'Admin Console'}
          </h1>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400 text-xs uppercase tracking-wider">
            {!collapsed && 'Management'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      activeClassName="bg-primary/20 text-primary"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="font-body">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-slate-900 border-t border-slate-700 p-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-body text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          {!collapsed && 'Return to Student View'}
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
