# Migration from Chakra UI to shadcn/ui - Complete Guide

## 🎯 **Migration Strategy**

Due to the extensive use of Chakra UI throughout the application, we need a systematic approach to migrate to shadcn/ui without breaking the entire application.

## ✅ **Completed Setup**

### **1. Dependencies Installed**
```bash
✅ Removed: @chakra-ui/react @emotion/react next-themes
✅ Added: tailwindcss postcss autoprefixer tailwindcss-animate
✅ Added: lucide-react class-variance-authority clsx tailwind-merge
✅ Added: @radix-ui/react-slot
```

### **2. Configuration Files Created**
- ✅ `tailwind.config.js` - Tailwind configuration with dark mode and brand colors
- ✅ `postcss.config.js` - PostCSS configuration
- ✅ `src/lib/utils.js` - Utility function for className merging
- ✅ `vite.config.js` - Added path alias for `@/`

### **3. Global Styles Updated**
- ✅ `src/index.css` - Replaced with Tailwind CSS and shadcn/ui variables
- ✅ Dark theme configured as default
- ✅ Sabi Ride brand colors (#0088CD) integrated

### **4. Basic Components Created**
- ✅ `src/components/ui/button.jsx` - Button with brand variant
- ✅ `src/components/ui/card.jsx` - Card components
- ✅ `src/components/ui/input.jsx` - Input component
- ✅ `src/components/ui/alert.jsx` - Alert component with variants

### **5. Sample Migration Completed**
- ✅ `src/components/Hero/HeroSection.jsx` - Successfully migrated to shadcn/ui

## 🔄 **Migration Approach Options**

### **Option A: Gradual Migration (Recommended)**
1. **Keep both systems temporarily**
2. **Migrate page by page**
3. **Remove Chakra UI after all pages are migrated**

### **Option B: Component Mapping (Faster)**
1. **Create compatibility layer**
2. **Map Chakra UI components to shadcn/ui**
3. **Global find & replace**

## 🛠 **Implementation Plan**

### **Phase 1: Create Compatibility Components**

Create wrapper components that mimic Chakra UI API but use shadcn/ui underneath:

```jsx
// src/components/compat/ChakraCompat.jsx
export const Box = ({ children, className, ...props }) => (
  <div className={cn("", className)} {...props}>
    {children}
  </div>
);

export const Text = ({ children, className, as = "p", ...props }) => {
  const Component = as;
  return (
    <Component className={cn("", className)} {...props}>
      {children}
    </Component>
  );
};

export const Container = ({ children, className, ...props }) => (
  <div className={cn("container mx-auto px-4", className)} {...props}>
    {children}
  </div>
);
```

### **Phase 2: Files That Need Migration**

#### **Priority 1: Core Layout Files**
- `src/App.jsx`
- `src/main.jsx` 
- `src/layout/RootLayout.jsx`
- `src/dashboard/layout/DashboardLayout.jsx`

#### **Priority 2: Landing Page Components**
- `src/components/Hero/HeroSection.jsx` ✅ **DONE**
- `src/components/FAQ/FAQ.jsx`
- `src/components/Footer/Footer.jsx`
- `src/components/Navbar/Navbar.jsx`

#### **Priority 3: Dashboard Pages**
- `src/dashboard/pages/start-mining/StartMining.jsx`
- `src/dashboard/pages/buy/BuyTokens.jsx`
- `src/dashboard/pages/swap/Swap.jsx`
- `src/dashboard/pages/convert/ConvertTokens.jsx`
- `src/dashboard/pages/rewards/Rewards.jsx`
- `src/dashboard/pages/admin/AdminPanel.jsx`

#### **Priority 4: Components**
- `src/dashboard/components/MiningPackage/MiningPackage.jsx`
- `src/dashboard/components/DashboardNav/DashboardNav.jsx`
- `src/components/MinersCard/MinersCard.jsx`

## 📋 **Component Mapping Reference**

### **Layout Components**
```jsx
// Chakra UI → shadcn/ui + Tailwind
<Box> → <div>
<Container> → <div className="container mx-auto px-4">
<VStack> → <div className="flex flex-col space-y-4">
<HStack> → <div className="flex items-center space-x-4">
<Flex> → <div className="flex">
```

### **Typography**
```jsx
<Text> → <p>, <span>, <div>
<Heading> → <h1>, <h2>, <h3>, etc.
```

### **Form Components**
```jsx
<Button> → <Button> (shadcn/ui)
<Input> → <Input> (shadcn/ui)
<Select> → <Select> (shadcn/ui - needs to be created)
<Textarea> → <Textarea> (shadcn/ui - needs to be created)
```

### **Feedback Components**
```jsx
<Alert> → <Alert> (shadcn/ui)
<Spinner> → <Loader2> (lucide-react)
<Badge> → <Badge> (shadcn/ui - needs to be created)
```

### **Data Display**
```jsx
<Card> → <Card> (shadcn/ui)
<CardBody> → <CardContent>
<CardHeader> → <CardHeader>
```

## 🎨 **Design System Mapping**

### **Colors**
```jsx
// Chakra UI props → Tailwind classes
bg="#0088CD" → bg-brand
color="gray.600" → text-muted-foreground
bg="gray.900" → bg-card
borderColor="gray.700" → border-border
```

### **Spacing**
```jsx
// Chakra UI → Tailwind
gap={4} → gap-4
padding={6} → p-6
margin="4" → m-4
```

### **Responsive Design**
```jsx
// Chakra UI → Tailwind
fontSize={{ base: "sm", md: "lg" }} → text-sm md:text-lg
w={{ base: "100%", md: "50%" }} → w-full md:w-1/2
```

## 🚀 **Quick Start Migration Script**

Create this temporary compatibility file to speed up migration:

```jsx
// src/lib/chakra-compat.js
export const chakraToTailwind = {
  // Background colors
  'bg="gray.900"': 'className="bg-card"',
  'bg="gray.800"': 'className="bg-secondary"',
  'bg="#0088CD"': 'className="bg-brand"',
  
  // Text colors  
  'color="white"': 'className="text-foreground"',
  'color="gray.400"': 'className="text-muted-foreground"',
  'color="#0088CD"': 'className="text-brand"',
  
  // Layout
  'display="flex"': 'className="flex"',
  'flexDirection="column"': 'className="flex-col"',
  'alignItems="center"': 'className="items-center"',
  'justifyContent="center"': 'className="justify-center"',
};
```

## ✅ **Migration Verification**

After migrating each component:

1. **Visual Check**: Ensure styling looks correct
2. **Functionality Check**: Test all interactive elements
3. **Responsive Check**: Test mobile and desktop views
4. **Dark Mode Check**: Verify dark theme still works

## 🎯 **Final Steps**

1. ✅ **Remove all Chakra UI imports**
2. ✅ **Delete unused Chakra UI files**
3. ✅ **Update documentation**
4. ✅ **Test build process**

## 🔗 **Resources**

- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)

## 📦 **Next Steps**

1. **Create additional shadcn/ui components needed**:
   - Select
   - Textarea  
   - Badge
   - Progress
   - Table components

2. **Migrate high-priority pages first**:
   - Start with layout files
   - Move to dashboard pages
   - Finish with utility components

3. **Test thoroughly after each migration**

The shadcn/ui migration will provide:
- ✅ Better stability and reliability
- ✅ Improved performance
- ✅ Modern React patterns
- ✅ Full TypeScript support
- ✅ No more Chakra UI compatibility issues