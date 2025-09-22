 import {SearchOutlined} from '@mui/icons-material'
 
 const Search = () => {
   return (
     <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-2">
            {/* Search input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <SearchOutlined className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Circle button */}
            <button className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
              <span className="text-sm font-medium">A</span>
            </button>
          </div>
        </div>
   )
 }
 
 export default Search
 
 