import { Container } from "@/components/ui/container"
import { Footer } from "@/components/ui/footer"
import Header from "@/components/ui/header"
import AuthHandler from "@/handlers/auth-handler"
import { Outlet } from "react-router-dom"

export const PublicLayout = () => {
  return (
    <div className="w-full">
      {/* handler to store the user data*/}
      <AuthHandler/>
      <Header/>

      <Container className="flex-grow">
        <main className="flex-grow">
          <Outlet/>
        </main>
      </Container>
      <Footer/>
    </div>
  )
}
