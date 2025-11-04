import whyJoin from "../../data/whyJoin";

interface WhyJoinItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const WhyJoinSection = () => {
  return (
    <section id="why-join">
      <div className="bg-gray-100">
        <div>
          <div className="items-center justify-center text-center p-5 py-10">
            <h1 className="text-xl sm:text-2xl font-bold">
              Why Join Localfix?
            </h1>
            <p className="text-gray-500 max-w-3xl mx-auto">
              Join hundreds of technicians already growing their business with
              LocalFix
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-6 p-4 lg:p-10">
            {(whyJoin as WhyJoinItem[]).map((why, idx) => (
              <div key={idx} className="p-6 lg:p-10 shadow rounded bg-white">
                <span className="bg-blue-100 p-3 lg:p-5 rounded-full text-blue-700 inline-block">
                  <why.icon />
                </span>
                <h2 className="text-lg font-bold">{why.title}</h2>
                <p className="text-sm lg:text-base">{why.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyJoinSection