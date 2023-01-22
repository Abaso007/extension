import Select from "../ui/select";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import PopIn from "../ui/popin";
import Loader from "../ui/loader";
import Button from "./Button";
import { FaCopy } from "react-icons/fa";
import { async } from "rxjs";

interface Request {
  prompt: string;
  mood: string;
  length: string;
  type: string;
  topics: string[];
}

interface Response {
  result: {
    data: {
      json: {
        value: string;
      };
    };
  };
}

const openAiRequest = async (request: Request) => {
  const res = await fetch(
    `http://localhost:3000/api/trpc/event.hello?batch=1&input=${encodeURIComponent(
      JSON.stringify({
        "0": {
          json: request,
        },
      })
    )}`,
    {
      mode: "cors",
    }
  );

  const data = (await res.json()) as Response[];
  return data[0]?.result?.data?.json;
};

type TopicConfig = {
  topic: string;
  color: string;
};

const Form = ({ onClose }: { onClose?: () => void }) => {
  const [prompt, setPrompt] = useState("");
  const [mood, setMood] = useState("");
  const [length, setLength] = useState("");
  const [type, setType] = useState("");
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [topics, setTopics] = useState<TopicConfig[]>([]);

  const { mutate, isLoading, isSuccess, data, reset } = useMutation(
    ["submit"],
    openAiRequest,
    {}
  );

  const promptField = (
    <div className="flex flex-row items-center gap-4">
      <label className="block text-xs font-medium text-gray-200">
        Respond to
      </label>
      <input
        type="text"
        className="mt-1 w-full rounded-md border-gray-700 bg-gray-800 p-2 text-sm text-white shadow-sm"
        onChange={(e) => {
          setPrompt(e.target.value);
        }}
      />
    </div>
  );

  const moodFields = (
    <div className="flex flex-row items-center gap-4">
      <Select
        setter={setMood}
        label="Mood"
        items={["😊 Happy", "🙃 Condescending", "😡 Angry", "🤢 Sickly"]}
      />
      <Select
        setter={setLength}
        label="Length"
        items={["📄 Short", "📕 Medium", "📚 Long"]}
      />
      <Select
        setter={setType}
        label="Type"
        items={["💼 Normal", "📜 Poem", "🎵 Song", "🎨 Story"]}
      />
    </div>
  );

  const addTopicConfig = (topic: string) => {
    if (topic === "") {
      return;
    }
    setTopics([
      ...topics,
      {
        topic: topic,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random color
      },
    ]);
    setCurrentTopic("");
  };

  const removeTopic = (i: number) => {
    const newTopics = [...topics];
    newTopics.splice(i, 1);
    setTopics(newTopics);
  };

  const topicFields = (
    <div>
      <div className="flex max-w-md flex-wrap gap-2 ">
        {topics.map((topic, i) => (
          <div
            key={`${topic.topic}-${topic.color}-${i}`}
            className="flex flex-wrap gap-2 rounded-xl px-2"
            style={{ background: topic.color }}
          >
            {topic.topic}
            <div
              className="cursor-pointer text-black"
              onClick={() => removeTopic(i)}
            >
              x
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-row items-center gap-4">
        <label className="block text-xs font-medium text-gray-200">
          Talk about
        </label>
        <input
          type="text"
          className="mt-1 w-full rounded-md border-gray-700 bg-gray-800 p-2 text-sm text-white shadow-sm"
          value={currentTopic}
          onChange={(e) => {
            setCurrentTopic(e.target.value);
          }}
        />
        <Button text="Add" onClick={() => addTopicConfig(currentTopic)} />
      </div>
    </div>
  );

  const results = <pre className="bg-gray-800 px-2 text-sm">{data?.value}</pre>;

  const showForm = !isLoading && !isSuccess;

  return (
    <AnimatePresence>
      <PopIn className="rounded-md bg-gradient-to-r from-sky-400 via-rose-400 to-lime-400 p-1">
        <div className="rounded-md bg-black text-white">
          <div className="flex flex-col gap-4 px-4 py-4">
            <div className="z-50 flex flex-row items-center justify-between border-b-2 border-b-white backdrop-blur-md">
              <img
                src="https://reworkd.ai/android-chrome-512x512.png"
                alt="Reworkd WordMark"
                className=" rounded object-cover"
                width={64}
              />
              <h1 className="text-4xl">Reworkd</h1>
              <button className="text-4xl" onClick={onClose}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z"
                    fill="currentColor"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
            {showForm && promptField}
            {showForm && moodFields}
            {showForm && topicFields}
            {isLoading && (
              <Loader size={60} className="flex flex-row justify-center" />
            )}
            {isSuccess && results}
            {showForm && (
              <button
                className="rounded-xl bg-green-400 px-4 py-2 text-2xl"
                onClick={() => {
                  mutate({
                    prompt,
                    mood,
                    length,
                    type,
                    topics: topics.map((topic) => topic.topic),
                  });
                }}
              >
                Generate
              </button>
            )}
            {isSuccess && (
              <div className="flex flex-row items-end justify-center gap-2">
                <button
                  onClick={reset}
                  className="rounded-xl bg-red-500 px-4 py-2 text-2xl"
                >
                  Reset
                </button>
                <button
                  onClick={onClose}
                  className="rounded-xl bg-gray-800 px-4 py-2 text-2xl"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    void window.navigator.clipboard
                      .writeText(data?.value || "")
                      .then();
                  }}
                  className="rounded-xl bg-gray-800 px-4 py-2 text-2xl"
                >
                  <FaCopy />
                </button>
              </div>
            )}
          </div>
        </div>
      </PopIn>
    </AnimatePresence>
  );
};

export default Form;
