import { useState, useEffect } from 'react';
import axios from 'axios';

interface Community {
  id: string;
  title: string;
  memberCount: number;
  messageCount: number;
  moderationActions: number;  // This field is now correctly inside the interface
}

export const Communities = () => {
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await axios.get('https://telegage-server.onrender.com/api/communities');
        setCommunities(response.data);
      } catch (error) {
        console.error('Failed to fetch communities:', error);
      }
    };

    fetchCommunities();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Communities</h2>
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Title
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Members
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Messages
            </th>
            {/* Uncomment the following line if you want to display moderation actions */}
            {/* <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Moderation Actions
            </th> */}
          </tr>
        </thead>
        <tbody>
          {communities.map((community) => (
            <tr key={community.id}>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {community.title}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {community.memberCount}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {community.messageCount}
              </td>
              {/* Uncomment the following line if you want to display moderation actions */}
              {/* <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {community.moderationActions}
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
