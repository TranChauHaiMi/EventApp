import EventForm from "@/components/EventForm";

export default function NewEventPage() {
    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-pastel-pink px-6 py-8 text-pink-700">
                    <h2 className="text-2xl font-bold">Tạo sự kiện</h2>
                    <p className="text-pink-700 mt-2">
                        Tạo sự kiện và bắt đầu bán vé
                    </p>
                </div>

                <div className="p-6">
                    <EventForm mode="create" />
                </div>
            </div>
        </div>
    );
}