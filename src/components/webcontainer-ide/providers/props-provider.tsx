import { WebContainerIDEProps } from '../types'
import { createContext } from 'react'

export const PropsContext = createContext<WebContainerIDEProps | null>(null)

export const PropsProvider = ({
  children,
  ...props
}: WebContainerIDEProps & { children: React.ReactNode }) => {
  return <PropsContext.Provider value={{ ...props }}>{children}</PropsContext.Provider>
}
