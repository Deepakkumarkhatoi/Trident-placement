"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDown, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"

const sidebarContext = React.createContext<{
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
} | null>(null)

function useSidebar() {
  const context = React.useContext(sidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const [openMobile, setOpenMobile] = React.useState(false)
    const [state, setState] = React.useState<"expanded" | "collapsed">("expanded")
    const [isMobile, setIsMobile] = React.useState(false)
    const open = openProp ?? defaultOpen
    const setOpen = setOpenProp ?? (() => {})

    React.useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768)
      }

      window.addEventListener("resize", handleResize)
      handleResize()

      return () => window.removeEventListener("resize", handleResize)
    }, [])

    const toggleSidebar = React.useCallback(() => {
      setState((prev) => (prev === "expanded" ? "collapsed" : "expanded"))
    }, [])

    const contextValue = React.useMemo(
      () => ({
        state,
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, openMobile, isMobile, toggleSidebar],
    )

    return (
      <sidebarContext.Provider value={contextValue}>
        <div
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn("group/sidebar-wrapper flex min-h-screen w-full has-[[data-variant=inset]]:bg-sidebar", className)}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </sidebarContext.Provider>
    )
  },
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { isMobile, openMobile, setOpenMobile, state } = useSidebar()

    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[--sidebar-width-mobile] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
            side={side}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        ref={ref}
        className="group peer hidden md:block text-sidebar-foreground"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
      >
        {/* This is the sidebar skeleton */}
        <div
          className={cn(
            "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[state=collapsed]:w-[--sidebar-width-icon]",
            className,
          )}
        />
        <div
          className={cn(
            "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            "group-data-[state=collapsed]:w-[--sidebar-width-icon]",
            variant === "inset" &&
              "top-0 z-0 h-auto border-r border-sidebar-border bg-sidebar pr-0 md:relative md:left-0 md:right-0 md:border-l",
          )}
          data-sidebar="sidebar"
          ref={ref}
        >
          <div className="flex h-full w-full flex-col bg-sidebar">{children}</div>
        </div>
      </div>
    )
  },
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <Menu />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      onClick={toggleSidebar}
      className={cn(
        "absolute inset-y-0 z-20 hidden w-1 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[var(--sidebar-width)] after:-translate-x-1/2 hover:after:bg-sidebar-accent active:after:bg-sidebar-accent group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:-right-4 [[data-side=right]_&]:left-0",
        className,
      )}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:bg-sidebar peer-data-[state=collapsed]:peer-[data-variant=inset]:min-h-svh",
        className,
      )}
      {...props}
    />
  ),
)
SidebarInset.displayName = "SidebarInset"

const sidebarMenuButtonVariants = cva(
  "flex items-center gap-2 overflow-hidden rounded-md outline-none ring-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 aria-disabled=true:pointer-events-none aria-disabled=true:opacity-50 relative px-2 py-1.5 text-sm font-medium",
  {
    variants: {
      variant: {
        default: "hover:bg-transparent active:bg-transparent",
        outline:
          "border border-sidebar-border bg-white hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:bg-sidebar",
      },
      size: {
        default: "h-7 rounded-md px-2",
        sm: "h-7 rounded-md px-2 text-xs",
        lg: "h-10 rounded-md px-2 text-sm group-data-[collapsible=icon]:p-0",
      },
      isActive: {
        true: "bg-sidebar-accent text-sidebar-accent-foreground",
      },
    },
    compoundVariants: [
      {
        isActive: true,
        variant: "outline",
        className: "bg-white text-sidebar-foreground dark:bg-sidebar",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> &
    VariantProps<typeof sidebarMenuButtonVariants> & {
      asChild?: boolean
      isActive?: boolean
      tooltip?: string | React.ComponentProps<typeof Tooltip>["children"]
    }
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref,
  ) => {
    const { isMobile, state } = useSidebar()
    const Comp = asChild ? Slot : "button"

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size, isActive }), className)}
        {...props}
      />
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip !== "string" && typeof tooltip !== "object") {
      return button
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side={isMobile ? "bottom" : state === "collapsed" ? "right" : "bottom"}>
          {typeof tooltip === "string" ? tooltip : (tooltip as any).children}
        </TooltipContent>
      </Tooltip>
    )
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} data-sidebar="menu" className={cn("flex flex-col gap-1", className)} {...props} />
  ),
)
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItemContext = React.createContext<{ isActive: boolean }>({
  isActive: false,
})

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />
  ),
)
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-0 flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
)
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ ...props }, ref) => <li ref={ref} {...props} />,
)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 rounded-md px-2 text-sidebar-foreground outline-none ring-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled=true:pointer-events-none aria-disabled=true:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:translate-x-0 text-xs data-[size=md]:h-8 data-[size=md]:text-sm",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        className,
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 z-10 hidden rounded-md p-1 outline-none ring-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-focus-within/menu-item:block group-hover/menu-item:block",
        showOnHover && "group-hover/menu-item:block",
        className,
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md border border-sidebar-border bg-sidebar px-1 text-xs font-medium text-sidebar-foreground group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
)
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarMenuSkeletonItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-sidebar="menu-skeleton-item" className={cn("flex h-8 gap-2 rounded-md bg-sidebar-accent px-2", className)} {...props} />
  ),
)
SidebarMenuSkeletonItem.displayName = "SidebarMenuSkeletonItem"

export {
  Sidebar,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuItemContext,
  SidebarMenuSkeletonItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
}
