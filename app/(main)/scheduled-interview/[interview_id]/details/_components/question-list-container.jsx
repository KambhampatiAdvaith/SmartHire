// app/dashboard/create-interview/components/question-list-container.jsx

const QuestionListContainer = ({ questionList }) => {
    return (
        <div className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
            {questionList.map((item, index) => (
                <div key={index} className="border-b pb-3 last:border-b-0">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                        {index + 1}. {item.question}
                    </p>
                    <span className="text-xs font-medium text-primary bg-blue-50 px-2 py-1 rounded-full">
                        {item.type}
                    </span>
                    {/* Optional: Add a button here to allow recruiters to delete/edit questions */}
                </div>
            ))}
        </div>
    );
};

export default QuestionListContainer;