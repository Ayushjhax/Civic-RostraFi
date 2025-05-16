import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from "./ui/animated-modal";
import { StickyScroll } from "./ui/sticky-scroll-reveal";
import Image from "next/image";
const content = [
  {
    title: "Collaborative Editing",
    description:
      "Work together in real time with your team, clients, and stakeholders. Collaborate on documents, share ideas, and make decisions quickly. With our platform, you can streamline your workflow and increase productivity.",
    content: (
      <div className="h-40 w-48 bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white rounded-lg">
        Collaborative Editing
      </div>
    ),
  },
  {
    title: "Real time changes",
    description:
      "See changes as they happen. With our platform, you can track every modification in real time. No more confusion about the latest version of your project. Say goodbye to the chaos of version control and embrace the simplicity of real-time updates.",
    content: (
      <div className="h-full w-full  flex items-center justify-center text-white">
        <Image
          src="https://ui.aceternity.com/_next/image?url=%2Flinear.webp&w=640&q=75"
          width={800}
          height={800}
          className="h-full w-full object-cover"
          alt="linear board demo"
        />
      </div>
    ),
  },
  {
    title: "Version control",
    description:
      "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates.",
    content: (
      <div className="h-40 w-48 bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white rounded-lg">
        Version control
      </div>
    ),
  },
  {
    title: "Running out of content",
    description:
      "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates.",
    content: (
      <div className="h-40 w-48 bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white rounded-lg">
        Running out of content
      </div>
    ),
  },
];

export function RulesModel() {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Modal>
        <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center items-center group/modal-btn rounded-full w-32 h-14 shadow-lg hover:shadow-xl transition-all overflow-hidden relative">
          <span className="absolute group-hover/modal-btn:translate-x-32 text-center transition-transform duration-500">
            Rules
          </span>
          <div className="-translate-x-32 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition-transform duration-500 text-2xl">
            📜
          </div>
        </ModalTrigger>
        <ModalBody className="p-0 md:max-w-[70%]">
          <ModalContent className="w-[80vw] h-[80vh] max-w-4xl max-h-[80vh] p-0">
            <div className="w-full h-full overflow-hidden">
              <StickyScroll
                content={content}
                contentClassName="w-full h-full px-6 py-8"
              />
            </div>
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  );
}
