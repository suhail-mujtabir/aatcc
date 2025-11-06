// 'use client';

// import * as React from 'react';
// import { useTheme } from 'next-themes';
// import { Moon, Sun } from 'lucide-react';
// import {
//   ThemeToggler as ThemeTogglerPrimitive,
//   type ThemeSelection,
//   type Resolved,
// } from '@/components/animate-ui/primitives/effects/theme-toggler';
// import { buttonVariants } from '@/components/animate-ui/components/buttons/icon';
// import { cn } from '@/lib/utils';

// const getIcon = (resolved: Resolved) => {
//   return resolved === 'dark' ? <Moon /> : <Sun />;
// };

// export default function UiTestPage() {
//   const [mounted, setMounted] = React.useState(false);
//   const { theme, resolvedTheme, setTheme } = useTheme();

//   React.useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted || !theme || !resolvedTheme) {
//     return (
//       <main className="flex items-center justify-center h-screen">
//         <div className={cn(buttonVariants({ variant: 'ghost', size: 'default' }))} />
//       </main>
//     );
//   }

//   return (
//     <main className="flex items-center justify-center h-screen">
//       <ThemeTogglerPrimitive
//         theme={theme as ThemeSelection}
//         resolvedTheme={resolvedTheme as Resolved}
//         setTheme={setTheme}
//         direction="btt"
//       >
//         {({ resolved, toggleTheme }) => (
//           <button
//             className={cn(buttonVariants({ variant: 'ghost', size: 'default' }))}
//             onClick={() => {
//               if (resolved === 'dark') {
//                 toggleTheme('light');
//               }
//             }}
//           >
//             {getIcon(resolved)}
//           </button>
//         )}
//       </ThemeTogglerPrimitive>
//     </main>
//   );
// }