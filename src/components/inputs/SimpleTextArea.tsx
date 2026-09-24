import React, { forwardRef } from "react";

interface SimpleTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  icon?: React.ReactNode;
}

const SimpleTextArea = forwardRef<HTMLTextAreaElement, SimpleTextAreaProps>(
  ({ label, icon, ...props }, ref) => {
    return (
      <div className=" w-full space-y-2 ">
        {label && (
          <div className="fieldset-label font-semibold">
            <span className="text-base">{label}</span>
          </div>
        )}
        <div className="textarea textarea-bordered flex items-center gap-2 w-full">
          {icon}
          <textarea className="grow" {...props} ref={ref} />
        </div>
      </div>
    );
  },
);

SimpleTextArea.displayName = "SimpleTextArea";

export default SimpleTextArea;
