import { Footer } from "@/components/ui/footer"
import Header from "@/components/ui/header"
import { Outlet } from "react-router-dom"

export const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* handler to store the user data*/}
      <Header/>

      <Outlet/>
      <Footer/>
    </div>
  )
}
