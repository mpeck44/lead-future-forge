import mikeHeadshot from "@/assets/mike-peck-headshot.jpg.asset.json";

const BioSection = () => (
  <section id="bio" className="py-[5.5rem] md:py-[7.5rem] bg-white">
    <div className="w-[min(1120px,100%-2.5rem)] mx-auto">
      <div className="rv max-w-[640px] mb-12">
        <span className="inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(40_72%_30%)]">
          <span className="w-2 h-2 rounded-full bg-gold" />
          Who built this
        </span>
        <h2 className="font-display font-semibold text-[clamp(1.85rem,4.2vw,2.7rem)] leading-[1.12] mt-[0.85rem]">
          Built in a district office, not a conference room.
        </h2>
      </div>

      <div className="grid gap-[2.6rem] md:gap-16 grid-cols-1 md:grid-cols-[340px_1fr] items-start">
        <div className="rv aspect-[4/5] rounded-lg overflow-hidden border border-foreground/10 max-w-[340px]">
          <img
            src={mikeHeadshot.url}
            alt="Mike Peck, K-12 Director of Technology and founder of The Leadership Forge"
            className="w-full h-full object-cover grayscale"
            width={340}
            height={425}
          />
        </div>

        <div>
          <div className="rv mb-[1.7rem]">
            <span className="inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(40_72%_30%)] mb-[0.45rem]">
              <span className="w-2 h-2 rounded-full bg-gold" />
              Role
            </span>
            <p className="text-foreground/65 max-w-[560px]">
              Built by a practicing K-12 Director of Technology in Pennsylvania. I lead AI integration in a working district every day: the policies, the pilots, the board questions, the staff concerns.
            </p>
          </div>
          <div className="rv rv-d1 mb-[1.7rem]">
            <span className="inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(40_72%_30%)] mb-[0.45rem]">
              <span className="w-2 h-2 rounded-full bg-gold" />
              Experience
            </span>
            <p className="text-foreground/65 max-w-[560px]">
              Worked with dozens of districts on exactly the problems this platform is built to solve.
            </p>
          </div>
          <div className="rv rv-d2">
            <span className="inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(40_72%_30%)] mb-[0.45rem]">
              <span className="w-2 h-2 rounded-full bg-gold" />
              Philosophy
            </span>
            <p className="font-display italic font-medium text-[clamp(1.3rem,2.4vw,1.7rem)] leading-[1.35] text-foreground border-l-[3px] border-gold pl-[1.3rem] mt-[1.1rem] max-w-[560px]">
              "I build practical tools educational leaders can put into practice today."
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default BioSection;
