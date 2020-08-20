using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace webrtcTest.Hubs
{
    public class TestHub: Hub
    {

        public override async Task OnConnectedAsync()
        {
            //await Clients.Client(Context.ConnectionId).SendAsync("iconnected", Context.ConnectionId);
            //await Groups.AddToGroupAsync(Context.ConnectionId, "SignalR Users");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var curId = Context.ConnectionId;
            var user = Constants.UserMappings[curId];

            Constants.UserMappings.Remove(curId);

            await Groups.RemoveFromGroupAsync(curId, user.Room);


            await Clients.GroupExcept(user.Room, curId).SendAsync("userdisconnected", user.UserId);

            //await Groups.RemoveFromGroupAsync(Context.ConnectionId, "SignalR Users");
            await base.OnDisconnectedAsync(exception);
        }


        public async Task joinroom(string roomid)
        {
            var curId = Context.ConnectionId;
            var userId = Guid.NewGuid().ToString();
            Constants.UserMappings.AddOrUpdate(curId, new UserObj {
                ConnId = curId,
                UserId = userId,
                Room = roomid,
            }) ;

            await Groups.AddToGroupAsync(curId, roomid);
            if (Constants.UserMappings.Values.Where(m=>m.Room == roomid).Count()>1)
            {
                //await Clients.GroupExcept(roomid, curId).SendAsync("userconnected", userId);
                await Clients.Caller.SendAsync("notfirstperson", userId);
            }
            else
            {
                await Clients.Caller.SendAsync("firstperson", userId);
            }

            Console.WriteLine($"\n room: {roomid} \n conId : {curId} \n UserId : {userId}");
        }

        public async Task startcall(string roomid, string connectionData)
        {
            var curId = Context.ConnectionId;

            var userCon = Constants.UserMappings[curId];
            userCon.webrtcData = connectionData;
            if (userCon != null)
            {
                await Clients.GroupExcept(roomid, curId).SendAsync("answercall", userCon.UserId, connectionData);
            }
            else
            {
                Console.WriteLine("User not found " + curId);
            }
        }

        public async Task answeringcall(string userid, string connectionData)
        {
            var userCon = Constants.UserMappings.Values.FirstOrDefault(m=>m.UserId == userid);
            if (userCon != null)
            {
                await Clients.Client(userCon.ConnId).SendAsync("receivecall", connectionData);
            }
            else
            {
                Console.WriteLine("User not found " + userid);
            }
        }
    }
}
