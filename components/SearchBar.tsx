import { Search } from "lucide-react";
import Form from 'next/form'

function SearchBar() {
    return (
        <div>
            <Form action={"/search"} className="relative">
                <input
                    type="text"
                    name="q" //query
                    placeholder="Tìm kiếm sự kiện..."
                    className="w-full py-3 px-4 pl-12 bg-white rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-base"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-pastel-pink text-pink-700 p-2 rounded-lg hover:bg-pastel-pink transition-colors duration-200"
                >
                    <Search className="w-6 h-6" />
                </button>
            </Form>
        </div>
    )
}

export default SearchBar
