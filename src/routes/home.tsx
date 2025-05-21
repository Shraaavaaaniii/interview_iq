import Marquee from "react-fast-marquee";
import { Container } from "@/components/ui/container";
import { MarqueImg } from "@/components/ui/marquee-img";


const HomePage = () => {
  return (<div className="flex-col w-full pb-24">
    <Container>
      <div className="my-8">
        <h2 className="text-3xl text-center md:text-left md:text-6xl">
          <span className="text-outline font-extrabold md:text-8xl">
          InterviewIQ 
          </span>
          <span className="text-gray-500 font-bold">
            -Prepare practice and succeed. 
          </span>
          </h2>
        <p className="mt-4 text-muted-foreground text-sm">
          Boost your interview skills and increase your success rate with AI driven insights
        </p>

        </div> 
        <div className="flex w-full items-center justify-evenly md:px-12 md:p">
        </div>
        {/* image section */}
        <div className="w-full mt-4 rounded-xl bg-gray-100 h-[420px] drop-shadow-md overflow-hidden relative">
          <img
            src="assets/img/hero.jpg"
            alt=""
            className="w-full h-full object-cover"
          />

          <div className="absolute top-4 left-4 px-4 py-2 rounded-md bg-white/40 backdrop-blur-md">
            Inteviews Copilot&copy;
          </div>

          
      </div>  
    </Container>
{/* marquee section */}
    <div className="w-full my-12">
   <Marquee pauseOnHover>
          <MarqueImg img="/assets/img/logo/google.png" />
          <MarqueImg img="/assets/img/logo/adobe.png" />
          <MarqueImg img="/assets/img/logo/infosys.png" />
          <MarqueImg img="/assets/img/logo/perssistence.png" />
          <MarqueImg img="/assets/img/logo/microsoft.png" />
    </Marquee>
    </div>

  </div>);
};

export default HomePage;
