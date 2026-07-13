import React from "react";
import CompanionForm from "@/app/components/CompanionForm";

const page = () => {
  return (
    <div className="px-4 md:px-12 pt-6 pb-12 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 text-neutral-900">
        Companion Builder
      </h1>
      <CompanionForm />
    </div>
  );
};

export default page;

