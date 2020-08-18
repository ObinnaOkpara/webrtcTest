using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace webrtcTest
{
    public static class Constants
    {
        public static Dictionary<string, UserObj> UserMappings = new Dictionary<string, UserObj>();



        public static void AddOrUpdate(this Dictionary<string, UserObj> dict, string key, UserObj val)
        {
            if (dict.ContainsKey(key))
            {
                dict[key] = val;
            }
            else
            {
                dict.Add(key, val);
            }
        }
    }

    public class UserObj
    {
        public string UserId { get; set; }
        public string Room { get; set; }
    }
}
