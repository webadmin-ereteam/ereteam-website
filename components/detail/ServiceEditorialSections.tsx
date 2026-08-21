import Image from "next/image";

type ServiceArea = {
  title: string;
  summary: string;
  content: string;
  technologies: string[];
  image: string;
};

type ProcessStep = {
  title: string;
  description: string;
};

type ServiceAreasEditorialProps = {
  areas: ServiceArea[];
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
};

type DeliveryEditorialProps = {
  steps: ProcessStep[];
  description: string;
  accent: string;
};

export function ServiceAreasEditorial({
  areas,
  eyebrow,
  title,
  description,
  accent,
}: ServiceAreasEditorialProps) {
  return (
    <section className="overflow-hidden bg-white py-20 sm:py-24">
      <div className="site-container">
        <header className="grid gap-5 border-b border-[#071a2a]/15 pb-10 lg:grid-cols-[.55fr_1.45fr] lg:gap-16 lg:pb-14">
          <p className="detail-eyebrow" style={{ color: accent }}>
            {eyebrow}
          </p>
          <div>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-brand-dark sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
              {description}
            </p>
          </div>
        </header>

        <div className="divide-y divide-[#071a2a]/15">
          {areas.map((area, index) => {
            const imageFirst = index % 2 === 0;

            return (
              <article
                key={area.title}
                className="grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20"
              >
                <div
                  className={`relative aspect-[4/3] overflow-hidden bg-brand-light lg:col-span-5 ${
                    imageFirst ? "lg:order-1" : "lg:order-2 lg:col-start-8"
                  }`}
                >
                  <Image
                    src={area.image}
                    alt={`${area.title} service overview`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover transition-transform duration-700 hover:scale-[1.025]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071A2A]/28 via-transparent to-transparent" />
                  <div
                    className="absolute bottom-0 left-0 h-1 w-20"
                    style={{ backgroundColor: accent }}
                  />
                </div>

                <div
                  className={`lg:col-span-6 ${
                    imageFirst ? "lg:order-2 lg:col-start-7" : "lg:order-1 lg:col-start-1"
                  }`}
                >
                  <h3 className="max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-brand-dark sm:text-4xl">
                    {area.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-lg font-medium leading-7 text-brand-dark/70 sm:text-xl">
                    {area.summary}
                  </p>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-text-body">
                    {area.content}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function DeliveryEditorial({ steps, description, accent }: DeliveryEditorialProps) {
  return (
    <section className="detail-section--dark bg-[#071A2A] py-20 text-white sm:py-24">
      <div className="site-container grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
        <header className="lg:sticky lg:top-32 lg:self-start">
          <p className="detail-eyebrow" style={{ color: accent }}>
            Delivery model
          </p>
          <h2 className="mt-5 max-w-md text-3xl font-semibold tracking-[-0.035em] sm:text-4xl lg:text-5xl">
            How We Deliver
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-white/62 sm:text-lg">
            {description}
          </p>
        </header>

        <div className="border-t border-white/20">
          {steps.map((step) => (
            <article
              key={step.title}
              className="grid gap-3 border-b border-white/20 py-7 sm:grid-cols-[minmax(150px,.55fr)_1fr] sm:gap-8 sm:py-9"
            >
              <div className="flex items-center gap-3 self-start">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                <h3 className="text-lg font-semibold text-white sm:text-xl">{step.title}</h3>
              </div>
              <p className="text-base leading-7 text-white/64">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
